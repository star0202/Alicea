import { basename } from 'node:path'
import { Emojis } from '#constants'
import AliceaEmbed from '#structures/Embed'

export const Eval = {
  default: (code: string) =>
    new AliceaEmbed().addChunkedFields({
      name: 'Input',
      value: code,
    }),

  success: (code: string, output: string) =>
    Eval.default(code)
      .setTitle('Successfully executed')
      .setColor('Green')
      .addChunkedFields({
        name: 'Output',
        value: output,
      }),

  error: (code: string, e: Error) =>
    Eval.default(code)
      .setTitle('Error occurred')
      .setColor('Red')
      .addChunkedFields({
        name: 'Stack trace',
        value: e.stack ?? 'N/A',
      }),
}

type ReloadResult = {
  file: string
  result: boolean
  error?: Error | undefined
  extensions?: object[] | undefined
}

export const Reload = {
  result: (res: ReloadResult[]) => {
    const { success, fail } = res.reduce(
      (acc, x) => {
        if (x.result) acc.success.push(x)
        else acc.fail.push(x)
        return acc
      },
      { success: [] as ReloadResult[], fail: [] as ReloadResult[] },
    )

    return new AliceaEmbed()
      .setTitle('Every module reloaded')
      .setDescription(
        `${Emojis.Success} ${success.length} ${Emojis.Fail} ${fail.length}`,
      )
      .addFields(
        {
          name: 'Success',
          value: success.map((x) => basename(x.file)).join('\n') || '*None*',
        },
        {
          name: 'Fail',
          value: fail.map((x) => basename(x.file)).join('\n') || '*None*',
        },
      )
  },
}

export const Sync = {
  success: () =>
    new AliceaEmbed()
      .setTitle('Commands synced')
      .setDescription(`${Emojis.Success} Done`),
}
