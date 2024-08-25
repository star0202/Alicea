import { listener } from '@pikokr/command.ts'
import type {
  GuildMember,
  Message,
  TextBasedChannel,
  VoiceState,
} from 'discord.js'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import type { Channel, User } from 'discord.js'
import { Colors } from '../../constants'
import type Database from '../../structures/Database'
import AliceaEmbed from '../../structures/Embed'
import AliceaExt from '../../structures/Extension'
import { diff } from '../../utils/object'
import { inspect } from '../../utils/object'
import { toTimestamp } from '../../utils/time'

const isIgnored = async (
  data: { id: string; channel: string },
  db: Database,
  user?: User,
  channel?: Channel,
) => {
  if (user?.bot) return true

  const ignoredChannels = await db.ignoredChannel.findMany({
    where: {
      guild: data.id,
    },
  })
  const ignoredUsers = await db.ignoredUser.findMany({
    where: {
      guild: data.id,
    },
  })

  if (ignoredChannels.some((c) => c.id === channel?.id)) return true
  if (ignoredUsers.some((u) => u.id === user?.id)) return true

  return false
}

class Logging extends AliceaExt {
  @listener({ event: 'messageUpdate' })
  async messageUpdateLogger(before: Message, after: Message) {
    if (!before.guild) return

    const data = await this.db.logChannel.findUnique({
      where: {
        id: before.guild.id,
      },
    })

    if (!data) return

    if (await isIgnored(data, this.db, before.author, before.channel)) return

    const channel = before.guild.channels.cache.get(
      data.channel,
    ) as TextBasedChannel

    const msgDiff = diff(after, before)

    await channel.send({
      embeds: [
        new AliceaEmbed()
          .setTitle('Message Updated')
          .setColor(Colors.Yellow)
          .setDetailedAuthor(before.author)
          .addFields(
            { name: 'User', value: `<@${after.author.id}>`, inline: true },
            { name: 'Channel', value: `<#${after.channelId}>`, inline: true },
          )
          .addChunkedFields(
            {
              name: 'Original',
              value: inspect(msgDiff.original),
            },
            {
              name: 'Updated',
              value: inspect(msgDiff.updated),
            },
          )
          .setUNIXTimestamp(),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(after.url)
            .setLabel('Go To Message'),
        ),
      ],
    })
  }

  @listener({ event: 'messageDelete' })
  async messageDeleteLogger(msg: Message) {
    if (!msg.guild) return

    const data = await this.db.logChannel.findUnique({
      where: {
        id: msg.guild.id,
      },
    })

    if (!data) return

    if (await isIgnored(data, this.db, msg.author, msg.channel)) return

    const channel = msg.guild.channels.cache.get(
      data.channel,
    ) as TextBasedChannel

    await channel.send({
      embeds: [
        new AliceaEmbed()
          .setTitle('Message Deleted')
          .setColor(Colors.Red)
          .setDetailedAuthor(msg.author)
          .addFields(
            { name: 'User', value: `<@${msg.author.id}>`, inline: true },
            { name: 'Channel', value: `<#${msg.channelId}>`, inline: true },
          )
          .addChunkedFields({
            name: 'Object',
            value: inspect(msg),
          })
          .setUNIXTimestamp(),
      ],
    })
  }

  @listener({ event: 'guildMemberAdd' })
  async memberJoinLogger(member: GuildMember) {
    if (!member.guild) return

    const data = await this.db.logChannel.findUnique({
      where: {
        id: member.guild.id,
      },
    })
    if (!data) return

    if (await isIgnored(data, this.db, member.user)) return

    const channel = member.guild.channels.cache.get(
      data.channel,
    ) as TextBasedChannel

    await channel.send({
      embeds: [
        new AliceaEmbed()
          .setTitle('Member Joined')
          .setColor(Colors.Green)
          .setDetailedAuthor(member)
          .addFields(
            { name: 'User', value: `<@${member.user.id}>`, inline: true },
            {
              name: 'Created At',
              value: `<t:${toTimestamp(member.user.createdAt)}:R>`,
              inline: true,
            },
          )
          .addChunkedFields({
            name: 'Object',
            value: inspect(member, ['guild']),
          })
          .setUNIXTimestamp(),
      ],
    })
  }

  @listener({ event: 'guildMemberRemove' })
  async memberLeaveLogger(member: GuildMember) {
    if (!member.guild) return

    const data = await this.db.logChannel.findUnique({
      where: {
        id: member.guild.id,
      },
    })

    if (!data) return

    if (await isIgnored(data, this.db, member.user)) return

    const channel = member.guild.channels.cache.get(
      data.channel,
    ) as TextBasedChannel

    await channel.send({
      embeds: [
        new AliceaEmbed()
          .setTitle('Member Left')
          .setColor(Colors.Red)
          .setDetailedAuthor(member)
          .addFields(
            {
              name: 'User',
              value: `<@${member.user.id}>`,
              inline: true,
            },
            {
              name: 'Joined At',
              value: member.joinedAt
                ? `<t:${toTimestamp(member.joinedAt)}:R>`
                : 'N/A',
              inline: true,
            },
          )
          .addChunkedFields({
            name: 'Object',
            value: inspect(member, ['guild']),
          })
          .setUNIXTimestamp(),
      ],
    })
  }

  @listener({ event: 'voiceStateUpdate' })
  async voiceJoinandLeaveLogger(oldState: VoiceState, newState: VoiceState) {
    if (!oldState.member || !newState.member) return

    const data = await this.db.logChannel.findUnique({
      where: {
        id: newState.guild.id,
      },
    })

    if (!data) return

    if (await isIgnored(data, this.db, newState.member.user)) return

    const channel = newState.guild.channels.cache.get(
      data.channel,
    ) as TextBasedChannel

    const embed = new AliceaEmbed()
      .setDetailedAuthor(newState.member)
      .setUNIXTimestamp()
      .addFields({
        name: 'User',
        value: `<@${newState.member.user.id}>`,
        inline: true,
      })

    const stateDiff = diff(newState, oldState)

    if (oldState.channelId && !newState.channelId) {
      embed
        .setTitle('Left Voice Channel')
        .setColor(Colors.Red)
        .addFields({
          name: 'Channel',
          value: `<#${oldState.channelId}>`,
          inline: true,
        })
    } else if (newState.channelId && !oldState.channelId) {
      embed
        .setTitle('Joined Voice Channel')
        .setColor(Colors.Green)
        .addFields({
          name: 'Channel',
          value: `<#${newState.channelId}>`,
          inline: true,
        })
    } else if (
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId !== newState.channelId
    ) {
      embed
        .setTitle('Moved Voice Channel')
        .setColor(Colors.Yellow)
        .addFields(
          {
            name: 'Old Channel',
            value: `<#${oldState.channelId}>`,
            inline: true,
          },
          {
            name: 'New Channel',
            value: `<#${newState.channelId}>`,
            inline: true,
          },
        )
    } else embed.setTitle('Voice State Updated').setColor(Colors.Yellow)

    await channel.send({
      embeds: [
        embed.addChunkedFields(
          {
            name: 'Old',
            value: inspect(stateDiff.original),
          },
          {
            name: 'New',
            value: inspect(stateDiff.updated),
          },
        ),
      ],
    })
  }
}

export const setup = async () => new Logging()
