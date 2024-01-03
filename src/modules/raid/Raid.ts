import { COLORS } from '../../constants'
import { raid } from '../../groups'
import AliceaEmbed from '../../structures/Embed'
import AliceaExt from '../../structures/Extension'
import { toTimestamp } from '../../utils/timestamp'
import { listener, option, ownerOnly } from '@pikokr/command.ts'
import type {
  GuildMember,
  MessageComponentInteraction,
  TextBasedChannel,
} from 'discord.js'
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  ComponentType,
  RoleSelectMenuBuilder,
} from 'discord.js'

class Raid extends AliceaExt {
  @listener({ event: 'guildMemberAdd' })
  async raidShield(member: GuildMember) {
    const data = await this.db.raid.findUnique({
      where: {
        id: member.guild.id,
      },
    })

    if (!data) return

    const now = new Date()
    const diff = now.getTime() - member.user.createdAt.getTime()

    if (diff > data.months * 30 * 24 * 60 * 60 * 1000) return

    await member.roles.add(data.role)

    const channel = await this.db.logChannel.findUnique({
      where: {
        id: member.guild.id,
      },
    })

    if (!channel) return

    const logChannel = member.guild.channels.cache.get(
      channel.channel
    ) as TextBasedChannel

    await logChannel.send({
      embeds: [
        new AliceaEmbed()
          .setTitle('Raid Shield Activated')
          .setDetailedAuthor(member)
          .setUNIXTimestamp()
          .setColor(COLORS.RED)
          .addFields(
            {
              name: 'User',
              value: `<@${member.user.id}>`,
              inline: true,
            },
            {
              name: 'Configured Months',
              value: `${data.months}`,
              inline: true,
            },
            {
              name: 'User Created At',
              value: `<t:${toTimestamp(member.user.createdAt)}:F>`,
            },
            {
              name: 'Server Time',
              value: `<t:${toTimestamp(now)}:F>`,
            }
          ),
      ],
    })
  }

  @ownerOnly
  @raid.command({ name: 'enable', description: '[OWNER] Enable raid shield' })
  async enable(
    i: ChatInputCommandInteraction,
    @option({
      type: ApplicationCommandOptionType.Integer,
      name: 'months',
      description: 'Months',
      required: true,
    })
    months: number
  ) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const res = await i.editReply({
      content: 'Select roles to add',
      components: [
        new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
          new RoleSelectMenuBuilder()
            .setCustomId('role')
            .setPlaceholder('Select roles')
        ),
      ],
    })

    let role = ''

    res
      .createMessageComponentCollector({
        filter: (j: MessageComponentInteraction) =>
          j.user.id === i.user.id && j.customId === 'role',
        componentType: ComponentType.RoleSelect,
      })
      .on('collect', async (j) => {
        await j.deferUpdate()

        role = j.values[0]

        const data = await this.db.raid.findUnique({
          where: {
            id: i.guild!.id,
          },
        })

        if (!data) {
          await this.db.raid.create({
            data: {
              id: i.guild!.id,
              role,
              months,
            },
          })
        } else {
          await this.db.raid.update({
            where: {
              id: i.guild!.id,
            },
            data: {
              role,
              months,
            },
          })
        }

        await j.editReply({
          content: 'Done',
          components: [],
        })
      })
  }

  @ownerOnly
  @raid.command({ name: 'disable', description: '[OWNER] Disable raid shield' })
  async disable(i: ChatInputCommandInteraction) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const data = await this.db.raid.findUnique({
      where: {
        id: i.guild.id,
      },
    })

    if (!data) {
      await i.editReply('Already disabled')

      return
    }

    await this.db.raid.delete({
      where: {
        id: i.guild.id,
      },
    })

    await i.editReply('Done')
  }

  @ownerOnly
  @raid.command({
    name: 'status',
    description: '[OWNER] Show raid shield status',
  })
  async status(i: ChatInputCommandInteraction) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const data = await this.db.raid.findUnique({
      where: {
        id: i.guild.id,
      },
    })

    if (!data) {
      await i.editReply('Disabled')

      return
    }

    await i.editReply({
      content: `Enabled\nRole: <@&${data.role}>\nMonths: ${data.months}`,
    })
  }
}

export const setup = async () => new Raid()
