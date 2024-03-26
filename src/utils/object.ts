import _ from 'lodash'
import { inspect } from 'util'

export const diff = <T extends object, F extends object>(
  after: T,
  before: F
): { original: Partial<F>; updated: Partial<T> } => {
  const diff = { original: {}, updated: {} }

  _.differenceWith(
    Object.entries(after),
    Object.entries(before),
    _.isEqual
  ).forEach(([k, v]) => {
    Object.defineProperty(diff.original, k, {
      value: before[k as keyof typeof before],
      enumerable: true,
    })

    Object.defineProperty(diff.updated, k, {
      value: v,
      enumerable: true,
    })
  })

  return diff
}

export const toString = <T>(obj: T, ignore?: (keyof T)[]): string => {
  let cur = obj
  if (ignore) {
    try {
      cur = structuredClone(obj)
    } catch (e) {
      console.error(e)
    }

    ignore.forEach((key) => delete cur[key])
  }

  return inspect(cur, {
    maxArrayLength: 200,
    depth: 2,
  })
}
