import type { CommandClient } from '@pikokr/command.ts'
import type { ChatInputCommandInteraction, User } from 'discord.js'
import { Permission } from '#embeds/Error'
import AliceaError from '#structures/Error'
import { createCommandCheckDecorator } from '.'

class OwnerOnlyError extends AliceaError {
  constructor(user: User) {
    super(`${user.tag}(${user.id}) - Invoked owner only command`)
  }
}

export const ownerOnly = createCommandCheckDecorator(
  async (client: CommandClient, i: ChatInputCommandInteraction) => {
    const isOwner = await client.isOwner(i.user)

    if (!isOwner) {
      await i.reply({
        embeds: [Permission.notOwner()],
        ephemeral: true,
      })

      throw new OwnerOnlyError(i.user)
    }
  },
)
