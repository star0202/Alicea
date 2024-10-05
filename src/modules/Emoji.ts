import AliceaExt from '../structures/Extension'
import { emoji } from '../groups'
import { option } from '@pikokr/command.ts'
import {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
} from 'discord.js'
import { ownerOnly } from '../checks/owner'
import AliceaEmbed from '../structures/Embed'

class Emoji extends AliceaExt {
  @ownerOnly
  @emoji.command({
    name: 'steal',
    description: 'Steals emojis',
  })
  async steal(
    i: ChatInputCommandInteraction,
    @option({
      name: 'emojis',
      type: ApplicationCommandOptionType.String,
      description: 'The emojis to steal',
      required: true,
    })
    emojis: string,
  ) {
    if (!i.guild) return

    await i.deferReply()

    const extracted = [...emojis.matchAll(/(?<=<:|<a:)[^<>]+(?=>)/g)].map(
      (e) => {
        const [name, id] = e[0].split(':')
        return { name, id }
      },
    )

    const res = await Promise.all(
      extracted.map(async (x) => {
        return i.guild!.emojis.create({
          name: x.name,
          attachment: `https://cdn.discordapp.com/emojis/${x.id}.png`,
        })
      }),
    )

    await i.editReply({
      embeds: [
        new AliceaEmbed().setTitle('Successfully stolen emojis').addFields(
          res.map((e) => ({
            name: e.name ?? 'Unknown',
            value: e.toString(),
          })),
        ),
      ],
    })
  }
}

export const setup = async () => new Emoji()
