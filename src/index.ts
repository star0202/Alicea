import { config } from './config'
import Alicea from './structures/Client'
import { Logger } from 'tslog'

const logger = new Logger({
  name: 'Main',
  prettyLogTemplate:
    '{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t[{{name}}]\t',
  prettyLogTimeZone: 'local',
  minLevel: config.debug ? 2 : 3,
})

const client = new Alicea(logger)

client.start()

process
  .on('unhandledRejection', (err) => logger.error(err))
  .on('uncaughtException', (err) => logger.error(err))
  .on('warning', (err) => logger.warn(err))
