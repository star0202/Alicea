import { COLORS } from '../../constants'
import AliceaExt from '../../structures/Extension'
import { chunkedFields } from '../../utils/embed'
import { isIgnored } from '../../utils/ignore'
import { diff } from '../../utils/object'
import { toTimestamp } from '../../utils/timestamp'
import { listener } from '@pikokr/command.ts'
import type {
  GuildMember,
  Message,
  TextBasedChannel,
  VoiceState,
} from 'discord.js'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js'

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
      data.channel
    ) as TextBasedChannel

    const msgDiff = diff(after, before)

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Message Updated')
          .setColor(COLORS.YELLOW)
          .setAuthor({
            name: `${after.author.tag} (${after.author.id})`,
            iconURL: after.author.displayAvatarURL(),
          })
          .addFields(
            { name: 'User', value: `<@${after.author.id}>`, inline: true },
            { name: 'Channel', value: `<#${after.channelId}>`, inline: true },
            ...chunkedFields('Original', msgDiff.original),
            ...chunkedFields('Updated', msgDiff.updated)
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(after.url)
            .setLabel('Go To Message')
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
      data.channel
    ) as TextBasedChannel

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Message Deleted')
          .setColor(COLORS.RED)
          .setAuthor({
            name: `${msg.author.tag} (${msg.author.id})`,
            iconURL: msg.author.displayAvatarURL(),
          })
          .addFields(
            { name: 'User', value: `<@${msg.author.id}>`, inline: true },
            { name: 'Channel', value: `<#${msg.channelId}>`, inline: true },
            ...chunkedFields('Object', msg, ['author'])
          ),
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
      data.channel
    ) as TextBasedChannel

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Member Joined')
          .setColor(COLORS.GREEN)
          .setAuthor({
            name: `${member.user.tag} (${member.user.id})`,
            iconURL: member.user.displayAvatarURL(),
          })
          .addFields(
            { name: 'User', value: `<@${member.user.id}>`, inline: true },
            {
              name: 'Created At',
              value: `<t:${toTimestamp(member.user.createdAt)}:R>`,
              inline: true,
            },
            ...chunkedFields('Object', member, ['guild'])
          )
          .setTimestamp(),
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
      data.channel
    ) as TextBasedChannel

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Member Left')
          .setColor(COLORS.RED)
          .setAuthor({
            name: `${member.user.tag} (${member.user.id})`,
            iconURL: member.user.displayAvatarURL(),
          })
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
            ...chunkedFields('Object', member, ['guild'])
          )
          .setTimestamp(),
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
      data.channel
    ) as TextBasedChannel

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${newState.member.user.tag} (${newState.member.user.id})`,
        iconURL: newState.member.user.displayAvatarURL(),
      })
      .setTimestamp()

    const stateDiff = diff(newState, oldState)

    if (oldState.channelId && !newState.channelId) {
      embed
        .setTitle('Left Voice Channel')
        .setColor(COLORS.RED)
        .addFields(
          {
            name: 'User',
            value: `<@${newState.member.user.id}>`,
            inline: true,
          },
          {
            name: 'Channel',
            value: `<#${oldState.channelId}>`,
            inline: true,
          },
          ...chunkedFields('Old', stateDiff.original),
          ...chunkedFields('New', stateDiff.updated)
        )
    } else if (newState.channelId && !oldState.channelId) {
      embed
        .setTitle('Joined Voice Channel')
        .setColor(COLORS.GREEN)
        .addFields(
          {
            name: 'User',
            value: `<@${newState.member.user.id}>`,
            inline: true,
          },
          {
            name: 'Channel',
            value: `<#${newState.channelId}>`,
            inline: true,
          },
          ...chunkedFields('Old', stateDiff.original),
          ...chunkedFields('New', stateDiff.updated)
        )
    } else if (
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId !== newState.channelId
    ) {
      embed
        .setTitle('Moved Voice Channel')
        .setColor(COLORS.YELLOW)
        .addFields(
          {
            name: 'User',
            value: `<@${newState.member.user.id}>`,
            inline: true,
          },
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
          ...chunkedFields('Old', stateDiff.original),
          ...chunkedFields('New', stateDiff.updated)
        )
    } else {
      embed
        .setTitle('Voice State Updated')
        .setColor(COLORS.YELLOW)
        .addFields(
          {
            name: 'User',
            value: `<@${newState.member.user.id}>`,
            inline: true,
          },
          ...chunkedFields('Old', stateDiff.original),
          ...chunkedFields('New', stateDiff.updated)
        )
    }

    await channel.send({
      embeds: [embed],
    })
  }
}

export const setup = async () => new Logging()
