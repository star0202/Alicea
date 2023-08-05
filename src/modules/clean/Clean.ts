import { clean } from '../../groups'
import CronManager from '../../structures/Cron'
import db from '../../utils/database'
import { Extension, option, ownerOnly } from '@pikokr/command.ts'
import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js'

class Clean extends Extension {
  private cron: CronManager

  constructor() {
    super()
    this.cron = new CronManager()
  }

  async start() {
    const jobs = await db.clean.findMany({
      include: {
        channels: true,
      },
    })

    jobs.forEach((job) => {
      this.cron.add({
        cronTime: '0 6 * * *',
        onTick: () => {
          job.channels.forEach(async (channel) => {
            const chn = this.client.guilds.cache
              .get(job.id)
              ?.channels.cache.get(channel.id)

            if (!chn) return

            if (
              !(
                chn.type === ChannelType.GuildText ||
                chn.type === ChannelType.GuildForum
              )
            )
              return

            const newChannel = await chn.clone({
              reason: 'Clean channel',
            })

            await db.clean.update({
              where: {
                id: job.id,
              },
              data: {
                channels: {
                  delete: {
                    id: channel.id,
                  },
                  create: {
                    id: newChannel.id,
                  },
                },
              },
            })

            await chn.delete()

            if (newChannel.type === ChannelType.GuildText) {
              await newChannel.send({
                content: '🗑️ *Cleaned!*',
              })
            }
          })
        },
      })
    })
  }

  @ownerOnly
  @clean.command({
    name: 'set',
    description: '[OWNER] Set channel to clean periodically',
  })
  async set(
    i: ChatInputCommandInteraction,
    @option({
      type: ApplicationCommandOptionType.Channel,
      name: 'channel',
      description: 'Channel to clean',
    })
    channel?: string
  ) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const chn = channel ?? i.channelId

    const data = await db.clean.findUnique({
      where: {
        id: i.guild.id,
      },
    })

    if (data) {
      await i.editReply(`✅ Turned off clean`)

      await db.clean.delete({
        where: {
          id: i.guild.id,
        },
      })

      return
    }

    await db.clean.create({
      data: {
        id: i.guild.id,
        channels: {
          create: [
            {
              id: chn,
            },
          ],
        },
      },
    })

    await i.editReply(
      '✅ Set channel to clean periodically\n*restart required*'
    )
  }

  @ownerOnly
  @clean.command({
    name: 'list',
    description: '[OWNER] List channels to clean periodically',
  })
  async list(i: ChatInputCommandInteraction) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const data = await db.clean.findUnique({
      where: {
        id: i.guild.id,
      },
      include: {
        channels: true,
      },
    })

    if (!data) {
      await i.editReply(`❌ No channel to clean`)

      return
    }

    await i.editReply(
      `✅ Channels to clean:\n${data.channels
        .map((channel) => `<#${channel.id}>`)
        .join(', ')}`
    )
  }
}

export const setup = async () => {
  const clean = new Clean()
  await clean.start()

  return clean
}
