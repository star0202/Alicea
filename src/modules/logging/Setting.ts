import { option, ownerOnly } from '@pikokr/command.ts'
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from 'discord.js'
import { logging } from '../../groups'
import AliceaExt from '../../structures/Extension'

class Setting extends AliceaExt {
  @ownerOnly
  @logging.command({
    name: 'set',
    description: '[OWNER] Set log channel',
  })
  async set(
    i: ChatInputCommandInteraction,
    @option({
      type: ApplicationCommandOptionType.Channel,
      name: 'channel',
      description: 'Log channel',
    })
    channel?: string,
  ) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const data = await this.db.logChannel.findUnique({
      where: {
        id: i.guild.id,
      },
    })

    const chn = channel ?? i.channelId

    if (!data) {
      await this.db.logChannel.create({
        data: {
          id: i.guild.id,
          channel: chn,
        },
      })

      await i.editReply(`✅ Log channel set to <#${chn}>`)
    } else {
      if (data.channel === chn) {
        await this.db.logChannel.delete({
          where: {
            id: i.guild.id,
          },
        })

        await i.editReply('✅ Log disabled')
      } else {
        await this.db.logChannel.update({
          where: {
            id: i.guild.id,
          },
          data: {
            channel: chn,
          },
        })

        await i.editReply(`✅ Log channel changed to <#${chn}>`)
      }
    }
  }

  @ownerOnly
  @logging.command({
    name: 'ignore',
    description: '[OWNER] Ignore channel or user',
  })
  async ignore(
    i: ChatInputCommandInteraction,
    @option({
      type: ApplicationCommandOptionType.Channel,
      name: 'channel',
      description: 'Channel to ignore',
    })
    channel?: string,
    @option({
      type: ApplicationCommandOptionType.User,
      name: 'user',
      description: 'User to ignore',
    })
    user?: string,
  ) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const data = await this.db.logChannel.findUnique({
      where: {
        id: i.guild.id,
      },
    })

    if (!data) {
      await i.editReply('❌ Log channel not set')
      return
    }

    if (channel || (!channel && !user)) {
      const chn = channel ?? i.channelId

      const ignored = await this.db.ignoredChannel.findUnique({
        where: {
          id: chn,
          guild: i.guild.id,
        },
      })

      if (ignored) {
        await this.db.ignoredChannel.delete({
          where: {
            id: chn,
          },
        })

        await i.editReply(`✅ <#${chn}> removed from ignored channels`)
      } else {
        await this.db.ignoredChannel.create({
          data: {
            id: chn,
            guild: i.guild.id,
          },
        })

        await i.editReply(`✅ <#${chn}> added to ignored channels`)
      }
    }

    if (user) {
      const ignored = await this.db.ignoredUser.findUnique({
        where: {
          id: user,
          guild: i.guild.id,
        },
      })

      if (ignored) {
        await this.db.ignoredUser.delete({
          where: {
            id: user,
            guild: i.guild.id,
          },
        })

        await i.editReply(`✅ <@${user}> removed from ignored users`)
      } else {
        await this.db.ignoredUser.create({
          data: {
            id: user,
            guild: i.guild.id,
          },
        })

        await i.editReply(`✅ <@${user}> added to ignored users`)
      }
    }
  }

  @ownerOnly
  @logging.command({
    name: 'list',
    description: '[OWNER] List settings',
  })
  async list(i: ChatInputCommandInteraction) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const data = await this.db.logChannel.findUnique({
      where: {
        id: i.guild.id,
      },
    })

    if (!data) {
      await i.editReply('❌ Log channel not set')
      return
    }

    const ignoredChannels = await this.db.ignoredChannel.findMany({
      where: {
        guild: i.guild.id,
      },
    })
    const ignoredUsers = await this.db.ignoredUser.findMany({
      where: {
        guild: i.guild.id,
      },
    })

    await i.editReply(
      `Log channel: <#${data.channel}>\nIgnored channels: ${ignoredChannels
        .map((chn) => `<#${chn.id}>`)
        .join(', ')}\nIgnored users: ${ignoredUsers
        .map((u) => `<@${u.id}>`)
        .join(', ')}`,
    )
  }
}

export const setup = async () => new Setting()
