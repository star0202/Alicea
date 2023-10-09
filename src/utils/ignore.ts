import type Database from '../structures/Database'
import type { Channel, User } from 'discord.js'

export const isIgnored = async (
  data: { id: string; channel: string },
  db: Database,
  user?: User,
  channel?: Channel
) => {
  const ignoredChannels = await db.ignoredChannel.findMany({
    where: {
      guild: data.id,
    },
  })
  const ignoredUsers = await db.ignoredUser.findMany({
    where: {
      guild: data.id,
    },
  })

  if (ignoredChannels.some((c) => c.id === channel?.id)) return true
  if (ignoredUsers.some((u) => u.id === user?.id)) return true

  return false
}
