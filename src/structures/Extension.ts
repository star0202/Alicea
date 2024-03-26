import type Alicea from './Client'
import { Extension } from '@pikokr/command.ts'

export default class AliceaExt extends Extension<Alicea> {
  protected get db() {
    return this.commandClient.db
  }
}
