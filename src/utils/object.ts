import { inspect as nodeInspect } from 'node:util'
import _ from 'lodash'

export const diff = <T extends object, F extends object>(
  after: T,
  before: F,
): { original: Partial<F>; updated: Partial<T> } => {
  const diff = { original: {}, updated: {} }

  for (const [k, v] of _.differenceWith(
    Object.entries(after),
    Object.entries(before),
    _.isEqual,
  )) {
    Object.defineProperty(diff.original, k, {
      value: before[k as keyof typeof before],
      enumerable: true,
    })

    Object.defineProperty(diff.updated, k, {
      value: v,
      enumerable: true,
    })
  }

  return diff
}

export const inspect = <T>(obj: T, ignore?: (keyof T)[]): string => {
  let cur = obj
  if (ignore) {
    try {
      cur = structuredClone(obj)
    } catch (e) {
      console.error(e)
    }

    for (const key of ignore) delete cur[key]
  }

  return nodeInspect(cur, {
    maxArrayLength: 200,
    depth: 2,
  })
}
