import { option, ownerOnly } from '@pikokr/command.ts'
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from 'discord.js'
import { moderation } from '../../groups'
import AliceaExt from '../../structures/Extension'

class Moderation extends AliceaExt {
  @ownerOnly
  @moderation.command({
    name: 'timeout',
    description: '[OWNER] Timeout a user',
  })
  async timeout(
    i: ChatInputCommandInteraction,
    @option({
      name: 'target',
      type: ApplicationCommandOptionType.User,
      description: 'The user to timeout',
      required: true,
    })
    target: string,
    @option({
      name: 'duration',
      type: ApplicationCommandOptionType.Integer,
      description: 'The duration of the timeout (in seconds, hour = 3600)',
      required: true,
    })
    duration: number,
    @option({
      name: 'reason',
      type: ApplicationCommandOptionType.String,
      description: 'The reason for the timeout',
      required: true,
    })
    reason: string,
  ) {
    await i.deferReply()

    if (!i.guild) return

    const member = i.guild.members.cache.get(target)

    if (!member) return i.editReply('User not found')

    await member.timeout(duration * 1000, reason)

    await i.editReply(`Timed out <@${member.id}> for ${duration}s`)
  }
}

export const setup = async () => new Moderation()
