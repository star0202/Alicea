import { join } from 'path'
import { CommandClient } from '@pikokr/command.ts'
import { green } from 'chalk'
import { ActivityType, Client } from 'discord.js'
import type { GatewayIntentBits } from 'discord.js'
import { short } from 'git-rev-sync'
import type { Logger } from 'tslog'
import { config } from '#config'
import { VERSION } from '#constants'
import Database from './Database'

export default class Alicea extends CommandClient {
  readonly db: Database

  constructor(config: {
    logger: Logger<unknown>
    intents: GatewayIntentBits[]
  }) {
    const { logger, intents } = config

    super(
      new Client({
        intents,
      }),
      logger,
    )

    this.discord.once('ready', (client) => this.onReady(client))

    this.discord.on('debug', (msg) => {
      this.logger.debug(msg)
    })

    this.db = new Database(logger)
  }

  async setup() {
    await this.enableApplicationCommandsExtension({ guilds: config.guilds })

    await this.registry.loadAllModulesInDirectory(
      join(__dirname, '..', 'modules'),
    )
  }

  async onReady(client: Client<true>) {
    client.user.setPresence({
      activities: [
        {
          name: `${VERSION} (${short() ?? 'N/A'})`,
          type: ActivityType.Playing,
        },
      ],
    })

    this.logger.info(`Logged in as: ${green(client.user.tag)}`)

    await this.fetchOwners()
  }

  async start() {
    await this.setup()

    await this.discord.login(config.token)

    await this.getApplicationCommandsExtension()?.sync()
  }
}
