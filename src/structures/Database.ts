import { type Prisma, PrismaClient } from '@prisma/client'
import { blue, yellow } from 'chalk'
import type { Logger } from 'tslog'

const config = {
  errorFormat: 'pretty' as const,
  log: [
    {
      emit: 'event',
      level: 'query',
    } as const,
  ],
}

export default class Database extends PrismaClient<typeof config> {
  logger: Logger<unknown>

  constructor(logger: Logger<unknown>) {
    super(config)

    this.logger = logger.getSubLogger({
      name: 'DB',
    })

    this.$on('query', (e: Prisma.QueryEvent) => {
      this.logger.debug(
        `${e.query.replaceAll('?', blue.bold('?'))} [${e.params
          .slice(1, -1)
          .split(',')
          .map((param) => blue.bold(param))
          .join(', ')}] - ${yellow.bold(`${e.duration}ms`)}`,
      )
    })
  }
}
