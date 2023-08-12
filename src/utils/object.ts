import { differenceWith, isEqual } from 'lodash'
import { inspect } from 'util'

export const diff = (
  after: object,
  before: object
): { original: object; updated: object } => {
  const diff = { original: {}, updated: {} }

  differenceWith(
    Object.entries(after),
    Object.entries(before),
    isEqual
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

export const toString = (obj: object, ignore?: string[]): string => {
  const copied = obj

  if (ignore) {
    ignore.forEach((key) => {
      delete copied[key as keyof typeof copied]
    })
  }

  return inspect(copied, {
    maxArrayLength: 200,
    depth: 2,
  })
}
