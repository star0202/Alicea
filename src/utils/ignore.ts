import type { Channel, User } from 'discord.js'

export const isIgnored = (
  data: {
    ignoredChannels?: {
      id: string
    }[]
    ignoredUsers: {
      id: string
    }[]
  },
  user?: User,
  channel?: Channel
) =>
  !data ||
  data.ignoredChannels?.some((c) => c.id === channel?.id) ||
  data.ignoredUsers.some((u) => u.id === user?.id) ||
  user?.bot
