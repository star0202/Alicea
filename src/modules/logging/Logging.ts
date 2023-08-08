import { COLORS } from '../../constants'
import db from '../../utils/database'
import { chunkedFields } from '../../utils/embed'
import { isIgnored } from '../../utils/ignore'
import { diff } from '../../utils/object'
import { toTimestamp } from '../../utils/timestamp'
import { Extension, listener } from '@pikokr/command.ts'
import type { GuildMember, Message, TextBasedChannel } from 'discord.js'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js'

class Logging extends Extension {
  @listener({ event: 'messageUpdate' })
  async messageUpdateLogger(before: Message, after: Message) {
    if (!before.guild) return

    const data = await db.log.findUnique({
      where: {
        id: before.guild.id,
      },
      include: {
        ignoredChannels: true,
        ignoredUsers: true,
      },
    })

    if (!data) return

    if (isIgnored(data, before.author, before.channel)) return

    const channel = before.guild.channels.cache.get(
      data.channel
    ) as TextBasedChannel

    const msgDiff = diff(after, before)

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Update')
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

    const data = await db.log.findUnique({
      where: {
        id: msg.guild.id,
      },
      include: {
        ignoredChannels: true,
        ignoredUsers: true,
      },
    })

    if (!data) return

    if (isIgnored(data, msg.author, msg.channel)) return

    const channel = msg.guild.channels.cache.get(
      data.channel
    ) as TextBasedChannel

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Deleted')
          .setColor(COLORS.RED)
          .setAuthor({
            name: `${msg.author.tag} (${msg.author.id})`,
            iconURL: msg.author.displayAvatarURL(),
          })
          .addFields(
            { name: 'User', value: `<@${msg.author.id}>`, inline: true },
            { name: 'Channel', value: `<#${msg.channelId}>`, inline: true },
            ...chunkedFields('Content', msg)
          ),
      ],
    })
  }

  @listener({ event: 'guildMemberAdd' })
  async memberJoinLogger(member: GuildMember) {
    if (!member.guild) return

    const data = await db.log.findUnique({
      where: {
        id: member.guild.id,
      },
      include: {
        ignoredUsers: true,
      },
    })

    if (!data) return

    if (isIgnored(data, member.user)) return

    const channel = member.guild.channels.cache.get(
      data.channel
    ) as TextBasedChannel

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Joined')
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
            ...chunkedFields('Object', member)
          )
          .setTimestamp(),
      ],
    })
  }

  @listener({ event: 'guildMemberRemove' })
  async memberLeaveLogger(member: GuildMember) {
    if (!member.guild) return

    const data = await db.log.findUnique({
      where: {
        id: member.guild.id,
      },
      include: {
        ignoredUsers: true,
      },
    })

    if (!data) return

    if (isIgnored(data, member.user)) return

    const channel = member.guild.channels.cache.get(
      data.channel
    ) as TextBasedChannel

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Left')
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
            ...chunkedFields('Object', member)
          )
          .setTimestamp(),
      ],
    })
  }
}

export const setup = async () => new Logging()
