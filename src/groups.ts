import { SubCommandGroup } from '@pikokr/command.ts'

export const logging = new SubCommandGroup({
  name: 'log',
  description: 'Logging',
})

export const welcome = new SubCommandGroup({
  name: 'welcome',
  description: 'Welcome',
})

export const clean = new SubCommandGroup({
  name: 'clean',
  description: 'Clean',
})

export const invite = new SubCommandGroup({
  name: 'invite',
  description: 'Invite',
})
