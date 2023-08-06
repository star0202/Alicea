import { clean } from '../../groups'
import CronManager from '../../structures/Cron'
import db from '../../utils/database'
import { Extension, option, ownerOnly } from '@pikokr/command.ts'
import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js'
import type { GuildBasedChannel } from 'discord.js'

const cleanChannel = async (chn: GuildBasedChannel) => {
  if (!(chn.type === ChannelType.GuildText)) return

  const newChannel = await chn.clone()

  await db.clean.update({
    where: {
      id: chn.guildId,
    },
    data: {
      channels: {
        delete: {
          id: chn.id,
        },
        create: {
          id: newChannel.id,
        },
      },
    },
  })

  await db.log.update({
    where: {
      id: chn.guildId,
    },
    data: {
      ignoredChannels: {
        delete: {
          id: chn.id,
        },
        create: {
          id: newChannel.id,
        },
      },
    },
  })

  await chn.delete()

  await newChannel.send({
    content: '🗑️ *Cleaned!*',
  })

  return newChannel
}

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

            await cleanChannel(chn)
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

    const data = await db.cleanChannel.findUnique({
      where: {
        id: chn,
        cleanId: i.guild.id,
      },
    })

    if (data) {
      await i.editReply(`✅ Turned off clean`)

      await db.cleanChannel.delete({
        where: {
          id: chn,
          cleanId: i.guild.id,
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

  @ownerOnly
  @clean.command({
    name: 'now',
    description: '[OWNER] Clean channel now',
  })
  async now(i: ChatInputCommandInteraction) {
    if (!i.guild || i.channel?.type !== ChannelType.GuildText) return

    await i.deferReply({
      ephemeral: true,
    })

    const chn = await cleanChannel(i.channel)

    if (!chn) {
      await i.editReply(`❌ Failed to clean channel`)

      return
    }
  }
}

export const setup = async () => {
  const clean = new Clean()
  await clean.start()

  return clean
}
