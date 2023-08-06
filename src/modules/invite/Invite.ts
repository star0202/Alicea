import { invite } from '../../groups'
import { Extension } from '@pikokr/command.ts'
import { ChannelType, ChatInputCommandInteraction } from 'discord.js'

class Invite extends Extension {
  @invite.command({
    name: 'create',
    description: 'Create invite',
  })
  async create(i: ChatInputCommandInteraction) {
    if (!i.guild || !(i.channel?.type === ChannelType.GuildText)) return

    await i.deferReply({
      ephemeral: true,
    })

    const invite = await i.guild.invites.create(i.channel, {
      maxAge: 0,
      maxUses: 1,
    })

    await i.editReply({
      content: invite.url,
    })
  }
}

export const setup = async () => new Invite()
