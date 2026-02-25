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
 * Erstellt eine Notification für einen User.
 * Kann überall im Server-Code aufgerufen werden, z.B. wenn ein Report erstellt wird.
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
 * Erstellt Notifications für alle Moderatoren/Admins.
 */
export async function notifyModerators(
  options: Omit<CreateNotificationOptions, "userId">,
) {
  const moderators = await prisma.user.findMany({
    where: { role: { in: ["MODERATOR", "ADMIN"] } },
    select: { id: true },
  })

  await prisma.notification.createMany({
    data: moderators.map((mod) => ({
      userId: mod.id,
      type: options.type,
      title: options.title,
      message: options.message,
      link: options.link,
      reportId: options.reportId,
    })),
  })
}
