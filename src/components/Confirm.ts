import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

export default class Confirm extends ActionRowBuilder<ButtonBuilder> {
  constructor() {
    super()

    this.addComponents(
      new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm')
        .setEmoji('⭕')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setEmoji('✖️')
        .setStyle(ButtonStyle.Danger)
    )
  }
}
