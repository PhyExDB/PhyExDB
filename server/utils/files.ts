import { unlinkSync } from "fs"
import { logger } from "~~/server/lib/loggers"

/**
 * Deletes a file from the filesystem at the specified path.
 */
export function myDeleteFile(filePath: string) {
  try {
    unlinkSync(filePath)
  } catch (error) {
    logger.error("Failed to delete file from filesystem", { error })
    throw createError({ status: 500, message: "Failed to delete file from filesystem" })
  }
}
