import type { NotificationType, ExperimentStatus } from '@prisma/client'

export type { NotificationType }

/**
 * Interface für ein Experiment-Snippet innerhalb einer Benachrichtigung.
 */
export interface NotificationExperiment {
  id: string
  name: string
  slug: string
  status: ExperimentStatus
  userId: string | null
}

export interface NotificationReport {
  id: string
  message: string
  seenByOwner: boolean
  experimentId: string
  experiment?: NotificationExperiment
}

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
 * Interface für die paginierte API-Antwort.
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

export function hasReport(notif: Notification): notif is Notification & { report: NotificationReport } {
  return !!notif.report
}
