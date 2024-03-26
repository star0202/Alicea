import { role } from '../../groups'
import AliceaExt from '../../structures/Extension'
import Confirm from '../../components/Confirm'
import { listener, ownerOnly } from '@pikokr/command.ts'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  RoleSelectMenuBuilder,
} from 'discord.js'
import type { MessageComponentInteraction } from 'discord.js'

const buttonStyleCycle = [
  ButtonStyle.Primary,
  ButtonStyle.Success,
  ButtonStyle.Danger,
]

class Role extends AliceaExt {
  @ownerOnly
  @role.command({
    name: 'setup',
    description: '[OWNER] Setup button roles',
  })
  async roleSetup(i: ChatInputCommandInteraction) {
    if (!i.guild || !i.channel?.isTextBased()) return

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
            .setMinValues(1)
            .setMaxValues(5)
        ),
        new Confirm(),
      ],
    })

    let selected: string[] = []
    res
      .createMessageComponentCollector({
        filter: (j: MessageComponentInteraction) =>
          j.user.id === i.user.id && j.customId === 'role',
        componentType: ComponentType.RoleSelect,
      })
      .on('collect', async (j) => {
        await j.deferUpdate()

        selected = j.values
      })

    res
      .createMessageComponentCollector({
        filter: (j: MessageComponentInteraction) => j.user.id === i.user.id,
        componentType: ComponentType.Button,
      })
      .on('collect', async (j) => {
        await j.deferUpdate()

        if (j.customId === 'confirm') {
          const roles = selected.map((r) => i.guild!.roles.cache.get(r)!)

          const msg = await i.channel!.send({
            content: 'Click to get / remove roles',
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                roles.map((r, idx) =>
                  new ButtonBuilder()
                    .setCustomId(`role${r.id}`)
                    .setLabel(r.name)
                    .setStyle(buttonStyleCycle[idx % buttonStyleCycle.length])
                )
              ),
            ],
          })

          await this.db.role.create({
            data: {
              id: msg.id,
            },
          })

          await i.editReply({
            content: '✅ Done',
            components: [],
          })
        } else {
          await i.editReply({
            content: '❌ Canceled',
            components: [],
          })
        }
      })
  }

  @listener({
    event: 'interactionCreate',
  })
  async giveRole(i: MessageComponentInteraction) {
    if (
      !i.guild ||
      !i.channel?.isTextBased() ||
      !i.isButton() ||
      !i.customId.startsWith('role')
    )
      return

    await i.deferReply({
      ephemeral: true,
    })

    const data = await this.db.role.findUnique({
      where: {
        id: i.message.id,
      },
    })

    if (!data) return

    const role = i.guild.roles.cache.get(i.customId.slice(4))

    if (!role) return

    const member = i.guild.members.cache.get(i.user.id)!

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role)
      await i.editReply({
        content: `✅ Removed <@&${role.id}>`,
        components: [],
      })

      return
    }

    await member.roles.add(role)
    await i.editReply({
      content: `✅ Added <@&${role.id}>`,
      components: [],
    })
  }
}

export const setup = async () => new Role()
