import { censor } from '../../groups'
import AliceaExt from '../../structures/Extension'
import { listener, option, ownerOnly } from '@pikokr/command.ts'
import type { Message, StringSelectMenuInteraction } from 'discord.js'
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
} from 'discord.js'

class Censor extends AliceaExt {
  @listener({
    event: 'messageCreate',
  })
  async censorMessage(msg: Message) {
    if (msg.author.bot || !msg.guild) return

    const rules = await this.db.censor.findMany({
      where: {
        id: msg.guild.id,
      },
    })

    Promise.all(
      rules.map(async (rule) => {
        const regex = new RegExp(rule.regex, 'g')

        if (regex.test(msg.content)) {
          await msg.reply({
            content: `You can't say that!\nReason: ||${rule.reason}||, Regex: ||/${rule.regex}/g||`,
          })

          await msg.delete()
        }
      })
    )
  }

  @ownerOnly
  @censor.command({
    name: 'add',
    description: '[OWNER] Add a rule',
  })
  async addRule(
    i: ChatInputCommandInteraction,
    @option({
      type: ApplicationCommandOptionType.String,
      name: 'regex',
      description: 'Regex',
      required: true,
    })
    regex: string,
    @option({
      type: ApplicationCommandOptionType.String,
      name: 'reason',
      description: 'Reason',
      required: true,
    })
    reason: string
  ) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    await this.db.censor.create({
      data: {
        id: i.guild.id,
        regex,
        reason,
      },
    })

    await i.editReply('Done')
  }

  @ownerOnly
  @censor.command({
    name: 'list',
    description: '[OWNER] List rules',
  })
  async listRules(i: ChatInputCommandInteraction) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const rules = await this.db.censor.findMany({
      where: {
        id: i.guild.id,
      },
    })

    if (!rules.length) {
      await i.editReply('No rules found')
      return
    }

    await i.editReply({
      content: 'List of rules',
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder().setCustomId('list').addOptions(
            rules.map((rule) => ({
              label: `${rule.reason} - /${rule.regex}/g`,
              value: rule.regex,
            }))
          )
        ),
      ],
    })
  }

  @ownerOnly
  @censor.command({
    name: 'delete',
    description: '[OWNER] Delete a rule',
  })
  async deleteRule(i: ChatInputCommandInteraction) {
    if (!i.guild) return

    await i.deferReply({
      ephemeral: true,
    })

    const rules = await this.db.censor.findMany({
      where: {
        id: i.guild.id,
      },
    })

    if (!rules.length) {
      await i.editReply('No rules found')
      return
    }

    const msg = await i.editReply({
      content: 'Select a rule to delete',
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder().setCustomId('delete').addOptions(
            rules.map((rule) => ({
              label: `${rule.reason} - /${rule.regex}/g`,
              value: rule.regex,
            }))
          )
        ),
      ],
    })

    msg
      .createMessageComponentCollector({
        filter: (j) =>
          j.user.id === i.user.id &&
          j.customId === 'delete' &&
          j.isStringSelectMenu(),
        time: 1000 * 60,
        max: 1,
      })
      .on('collect', async (j: StringSelectMenuInteraction) => {
        await j.deferUpdate()

        await this.db.censor.delete({
          where: {
            id: i.guild!.id,
            regex: j.values[0],
          },
        })

        await j.editReply({
          content: 'Done',
          components: [],
        })
      })
  }
}

export const setup = async () => new Censor()
