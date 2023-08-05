import { welcome } from '../../groups'
import Confirm from '../../structures/components/Confirm'
import db from '../../utils/database'
import { Extension, listener, ownerOnly } from '@pikokr/command.ts'
import type { GuildMember } from 'discord.js'
import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  RoleSelectMenuBuilder,
} from 'discord.js'

class Welcome extends Extension {
  @listener({ event: 'guildMemberAdd' })
  async welcomeRole(member: GuildMember) {
    const data = await db.welcome.findUnique({
      where: {
        id: member.guild.id,
      },
    })

    if (!data) return

    const id = member.user.bot ? data.bot : data.user

    if (!id) return

    const role = member.guild.roles.cache.get(id)

    if (!role) return

    await member.roles.add(role)
  }

  @ownerOnly
  @welcome.command({
    name: 'set',
    description: '[OWNER] Set welcome role',
  })
  async set(i: ChatInputCommandInteraction) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const res = await i.editReply({
      components: [
        new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
          new RoleSelectMenuBuilder()
            .setCustomId('user')
            .setPlaceholder('Select user role')
        ),

        new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
          new RoleSelectMenuBuilder()
            .setCustomId('bot')
            .setPlaceholder('Select bot role')
        ),

        new Confirm(),
      ],
    })

    let user: string | null = null
    let bot: string | null = null

    res
      .createMessageComponentCollector({
        filter: (c) => c.customId === 'user',
        componentType: ComponentType.RoleSelect,
      })
      .on('collect', async (c) => {
        await c.deferUpdate()

        user = c.values[0]
      })

    res
      .createMessageComponentCollector({
        filter: (c) => c.customId === 'bot',
        componentType: ComponentType.RoleSelect,
      })
      .on('collect', async (c) => {
        await c.deferUpdate()

        bot = c.values[0]
      })

    res
      .createMessageComponentCollector({
        filter: (c) => c.customId === 'confirm',
        componentType: ComponentType.Button,
      })
      .on('collect', async (c) => {
        await c.deferUpdate()

        const data = await db.welcome.findUnique({
          where: {
            id: i.guild!.id,
          },
        })

        if (data) {
          if (data.bot === bot) {
            bot = null
          }

          if (data.user === user) {
            user = null
          }
        }

        await db.welcome.upsert({
          where: {
            id: i.guild!.id,
          },
          create: {
            id: i.guild!.id,
            bot,
            user,
          },
          update: {
            bot,
            user,
          },
        })

        await i.editReply({
          content: `✅ Welcome role set\nUser: ${
            user ? `<@&${user}>` : 'None'
          }\nBot: ${bot ? `<@&${bot}>` : 'None'}`,
          components: [],
        })
      })
  }
}

export const setup = async () => new Welcome()
