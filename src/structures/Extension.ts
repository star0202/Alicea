import type Alicea from './Client'
import { Extension } from '@pikokr/command.ts'

export default class AliceaExt extends Extension {
  protected get commandClient() {
    return super.commandClient as Alicea
  }

  protected get db() {
    return this.commandClient.db
  }
}
