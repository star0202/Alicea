import { Colors } from '../constants'
import AliceaEmbed from '../structures/Embed'

export class Permission {
  static notOwner = () =>
    new AliceaEmbed()
      .setTitle('Permission Denied')
      .setDescription('You are not the owner of this bot.')
      .setColor(Colors.DarkRed)
}
