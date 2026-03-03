import type { NotificationType } from "@prisma/client"

interface CreateNotificationOptions {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  reportId?: string
}

/**
 * Creates a notification for a specific user.
 */
export async function createNotification(options: CreateNotificationOptions) {
  return prisma.notification.create({
    data: {
      userId: options.userId,
      type: options.type,
      title: options.title,
      message: options.message,
      link: options.link,
      reportId: options.reportId,
    },
  })
}

/**
 * Creates notifications for all moderators and admins.
 */
export async function notifyModerators(
  options: Omit<CreateNotificationOptions, "userId"> & { excludeId?: string },
) {
  const moderatorIds = await getModeratorIds(options.excludeId)

  if (moderatorIds.length === 0) return

  await prisma.notification.createMany({
    data: moderatorIds.map(id => ({
      userId: id,
      type: options.type,
      title: options.title,
      message: options.message,
      link: options.link,
      reportId: options.reportId,
    })),
  })
}
