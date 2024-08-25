import AliceaEmbed from '#structures/Embed'

export const Permission = {
  notOwner: () =>
    new AliceaEmbed()
      .setTitle('Permission Denied')
      .setDescription('You are not the owner of this bot.')
      .setColor('DarkRed'),
}
