import { chunk } from './chunk'
import { toString } from './object'
import { EmbedField, codeBlock } from 'discord.js'

export const chunkedFields = (
  name: string,
  content: string | object,
  ignore?: string[]
): EmbedField[] => {
  if (typeof content === 'object') {
    content = toString(content, ignore)
  }

  const chunked = chunk(content, 1024 - 10)

  return chunked.map((chunk, i) => ({
    name: `${name} ${i + 1} / ${chunked.length}`,
    value: codeBlock('ts', chunk),
    inline: false,
  }))
}
