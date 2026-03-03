import type { NotificationType, ExperimentStatus } from "@prisma/client"

export type { NotificationType }

/**
 * Represents a simplified experiment object attached to notifications.
 */
export interface NotificationExperiment {
  id: string
  name: string
  slug: string
  status: ExperimentStatus
  userId: string | null
}

/**
 * Metadata for notifications triggered by reports.
 */
export interface NotificationReport {
  id: string
  message: string
  seenByOwner: boolean
  experimentId: string
  experiment?: NotificationExperiment
}

/**
 * The core Notification model.
 */
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string | Date
  updatedAt: string | Date
  userId: string

  reportId?: string | null
  report?: NotificationReport

  experiment?: NotificationExperiment
}

/**
 * Standard paginated response for the notification list API.
 */
export interface NotificationResponse {
  items: Notification[]
  unreadCount: number
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}
