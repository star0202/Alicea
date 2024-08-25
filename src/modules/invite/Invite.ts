import { ownerOnly } from '@pikokr/command.ts'
import { ChannelType, type ChatInputCommandInteraction } from 'discord.js'
import { invite } from '#groups'
import AliceaExt from '#structures/Extension'

class Invite extends AliceaExt {
  @ownerOnly
  @invite.command({
    name: 'create',
    description: '[OWNER] Create invite',
  })
  async create(i: ChatInputCommandInteraction) {
    if (!i.guild || !(i.channel?.type === ChannelType.GuildText)) return

    await i.deferReply({
      ephemeral: true,
    })

    const invite = await i.guild.invites.create(i.channel, {
      maxAge: 0,
      maxUses: 1,
      unique: true,
    })

    await i.editReply({
      content: invite.url,
    })
  }
}

export const setup = async () => new Invite()
