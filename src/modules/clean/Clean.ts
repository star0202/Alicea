import { clean } from '../../groups'
import CronManager from '../../structures/Cron'
import AliceaExt from '../../structures/Extension'
import { option, ownerOnly } from '@pikokr/command.ts'
import { PrismaClient } from '@prisma/client'
import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js'
import type { GuildBasedChannel } from 'discord.js'

const cleanChannel = async (db: PrismaClient, chn?: GuildBasedChannel) => {
  if (!chn) return

  if (!(chn.type === ChannelType.GuildText)) return

  const newChannel = await chn.clone()

  await db.cleanChannel.updateMany({
    where: {
      id: chn.id,
    },
    data: {
      id: newChannel.id,
    },
  })

  await db.ignoredChannel.updateMany({
    where: {
      id: chn.id,
    },
    data: {
      id: newChannel.id,
    },
  })

  await chn.delete()

  await newChannel.send({
    content: '🗑️ *Cleaned!*',
  })

  return newChannel
}

class Clean extends AliceaExt {
  private cron: CronManager

  constructor() {
    super()
    this.cron = new CronManager()

    this.cron.add({
      cronTime: '0 6 * * *',
      onTick: async () => {
        const jobs = await this.db.cleanChannel.findMany()

        Promise.all(
          jobs
            .flatMap(
              (job) =>
                this.client.channels.cache.get(job.id) as GuildBasedChannel
            )
            .map((c) => cleanChannel(this.db, c))
        )
      },
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
    channel?: string,
    @option({
      type: ApplicationCommandOptionType.Boolean,
      name: 'clean_allowed',
      description: 'Clean allowed?',
    })
    cleanAllowed?: boolean
  ) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const chn = channel ?? i.channelId

    const data = await this.db.cleanChannel.findUnique({
      where: {
        id: chn,
      },
    })

    if (data) {
      await i.editReply(`✅ Turned off clean`)

      await this.db.cleanChannel.delete({
        where: {
          id: chn,
        },
      })

      return
    }

    await this.db.cleanChannel.create({
      data: {
        id: chn,
        guild: i.guild.id,
        cleanAllowed: cleanAllowed,
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

    const data = await this.db.cleanChannel.findMany({
      where: {
        guild: i.guild.id,
      },
    })

    if (!data) {
      await i.editReply(`❌ No channel to clean`)

      return
    }

    await i.editReply(
      `✅ Channels to clean:\n${data
        .map(
          (channel) =>
            `<#${channel.id}>${
              channel.cleanAllowed ? '(manual clean allowed)' : ''
            }`
        )
        .join(', ')}`
    )
  }

  @clean.command({
    name: 'now',
    description: 'Clean channel now',
  })
  async now(i: ChatInputCommandInteraction) {
    if (!i.guild || i.channel?.type !== ChannelType.GuildText) return

    await i.deferReply({
      ephemeral: true,
    })

    const data = await this.db.cleanChannel.findUnique({
      where: {
        id: i.channelId,
      },
    })

    if (!data) {
      await i.editReply(`❌ Channel is not allowed to clean`)

      return
    }

    if (!data.cleanAllowed) {
      await i.editReply(`❌ Clean is not allowed`)

      return
    }

    const chn = await cleanChannel(this.db, i.channel)

    if (!chn) {
      await i.editReply(`❌ Failed to clean channel`)

      return
    }
  }
}

export const setup = async () => new Clean()
