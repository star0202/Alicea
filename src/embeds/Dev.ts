import { Emojis } from '#constants'
import AliceaEmbed from '#structures/Embed'
import { basename } from 'path'

export class Eval {
  private static default = (code: string) =>
    new AliceaEmbed().addChunkedFields({
      name: 'Input',
      value: code,
    })

  static success = (code: string, output: string) =>
    this.default(code)
      .setTitle('Successfully executed')
      .setColor('Green')
      .addChunkedFields({
        name: 'Output',
        value: output,
      })

  static error = (code: string, e: Error) =>
    this.default(code)
      .setTitle('Error occurred')
      .setColor('Red')
      .addChunkedFields({
        name: 'Stack trace',
        value: e.stack ?? 'N/A',
      })
}

type ReloadResult = {
  file: string
  result: boolean
  error?: Error | undefined
  extensions?: object[] | undefined
}

export class Reload {
  static result = (res: ReloadResult[]) => {
    const { success, fail } = res.reduce(
      (acc, x) => {
        if (x.result) acc.success.push(x)
        else acc.fail.push(x)
        return acc
      },
      { success: [] as ReloadResult[], fail: [] as ReloadResult[] }
    )

    return new AliceaEmbed()
      .setTitle('Every module reloaded')
      .setDescription(
        `${Emojis.Success} ${success.length} ${Emojis.Fail} ${fail.length}`
      )
      .addFields(
        {
          name: 'Success',
          value: success.map((x) => basename(x.file)).join('\n') || '*None*',
        },
        {
          name: 'Fail',
          value: fail.map((x) => basename(x.file)).join('\n') || '*None*',
        }
      )
  }
}

export class Sync {
  static success = () =>
    new AliceaEmbed()
      .setTitle('Commands synced')
      .setDescription(`${Emojis.Success} Done`)
}
