import { toString } from '../utils/object'
import { toTimestamp } from '../utils/timestamp'
import {
  EmbedBuilder,
  GuildMember,
  codeBlock,
  normalizeArray,
} from 'discord.js'
import type { APIEmbedField, RestOrArray, User } from 'discord.js'

const chunk = (content: string, limit = 1024 - 10) => {
  const chunked = []
  let cur = 0
  let end = limit

  while (cur < content.length) {
    end = cur + limit

    if (end >= content.length) {
      chunked.push(content.slice(cur))

      break
    }

    const lastNewline = content.lastIndexOf('\n', end)
    if (lastNewline !== -1 && lastNewline > cur) end = lastNewline

    chunked.push(content.slice(cur, end))

    cur = end + 1
  }

  return chunked
}

export default class AliceaEmbed extends EmbedBuilder {
  addChunkedFields(
    ...fields: RestOrArray<
      Omit<APIEmbedField, 'value'> & {
        value: string | object
        lang?: string
        ignore?: string[]
      }
    >
  ) {
    normalizeArray(fields).forEach((field) => {
      const { lang, ignore, name, value, inline } = field

      const chunked = chunk(
        typeof value === 'string' ? value : toString(value, ignore)
      )

      chunked.forEach((v, idx) =>
        this.addFields({
          name: `${name} ${idx + 1}/${chunked.length}`,
          value: codeBlock(lang ?? 'ts', v),
          inline,
        })
      )
    })

    return this
  }

  setDetailedAuthor(userOrMember: User | GuildMember) {
    const user =
      userOrMember instanceof GuildMember ? userOrMember.user : userOrMember

    return this.setAuthor({
      name: `${user.tag} (${user.id})`,
      iconURL: user.displayAvatarURL(),
    })
  }

  setUNIXTimestamp(timestamp = Date.now()) {
    this.setFooter({
      text: toTimestamp(timestamp),
    })
    return this.setTimestamp(timestamp)
  }
}
