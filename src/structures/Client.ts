import { config } from '../config'
import { VERSION } from '../constants'
import type { Rule } from '../types'
import Database from './Database'
import { CommandClient } from '@pikokr/command.ts'
import { green } from 'chalk'
import { ActivityType, Client } from 'discord.js'
import { short } from 'git-rev-sync'
import { Jejudo } from 'jejudo'
import { join } from 'path'
import { Logger } from 'tslog'

export default class Alicea extends CommandClient {
  private jejudo: Jejudo | null = null

  readonly db: Database

  rules: Map<string, Rule[]> = new Map()

  constructor(logger: Logger<unknown>) {
    super(
      new Client({
        intents: ['GuildMessages', 'Guilds', 'MessageContent', 'GuildMembers'],
      }),
      logger
    )

    this.discord.once('ready', (client) => this.onReady(client))

    this.discord.on('debug', (msg) => {
      this.logger.debug(msg)
    })

    this.db = new Database(this.logger)
  }

  async setup() {
    await this.enableApplicationCommandsExtension({ guilds: config.guilds })

    await this.registry.loadAllModulesInDirectory(
      join(__dirname, '..', 'modules')
    )
  }

  async onReady(client: Client<true>) {
    this.jejudo = new Jejudo(client, {
      isOwner: (user) => this.owners.has(user.id),
      prefix: `<@${client.user.id}> `,
      noPermission: (i) => i.reply('Permission denied'),
    })

    client.on('messageCreate', (msg) => this.jejudo?.handleMessage(msg))

    client.on('interactionCreate', (i) => {
      this.jejudo?.handleInteraction(i)
    })

    client.user.setPresence({
      activities: [
        {
          name: `${VERSION} (${short()})`,
          type: ActivityType.Playing,
        },
      ],
    })

    this.logger.info(`Logged in as: ${green(client.user.tag)}`)

    await this.fetchOwners()

    await this.reloadRules()
  }

  async start() {
    await this.setup()

    await this.discord.login(config.token)

    await this.getApplicationCommandsExtension()?.sync()
  }

  async reloadRules() {
    const rules = await this.db.censor.findMany()

    rules.forEach((rule) => {
      const id = rule.id

      if (!this.rules.has(id)) {
        this.rules.set(id, [])
      }

      this.rules.get(id)?.push({
        regex: rule.regex,
        reason: rule.reason,
      })
    })
  }
}
