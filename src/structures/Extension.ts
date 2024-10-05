import { Extension } from '@pikokr/command.ts'
import type Alicea from './Client'

export default class AliceaExt extends Extension<Alicea> {
  protected get db() {
    return this.commandClient.db
  }
}
