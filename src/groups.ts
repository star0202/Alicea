import { SubCommandGroup } from '@pikokr/command.ts'

export const logging = new SubCommandGroup({
  name: 'log',
  description: 'Logging',
})
