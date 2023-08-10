import { config } from './config'
import Alicea from './structures/Client'
import { getLogger } from './utils/logging'

const client = new Alicea(getLogger('Client', config.debug ? 2 : 3))

;(async () => await client.start())()
