import fs from "fs"
import { relativeFileUploadDirectory } from "../../api/files/index.post"

export default defineTask({
  meta: {
    name: "db:remove-unlinked-files",
    description: "Remove files that are not linked to any records",
  },
  run: async () => {
    logger.info("Running DB remove unlinked files task...")

    const filesWithoutBacklinks = await prisma.file.findMany({
      where: {
        experimentFile: { none: {} },
        experimentPreviewFile: { none: {} },
        userFile: { is: null },
      },
    })

    logger.info(`Found ${filesWithoutBacklinks.length} files without backlinks`)

    const runtimeConfig = useRuntimeConfig()
    for (const file of filesWithoutBacklinks) {
      const filePath = `${runtimeConfig.fileMount}/${file.path}`
      try {
        await fs.promises.unlink(filePath)
        logger.info(`Removed file at ${filePath}`)
      } catch (error) {
        logger.error(`Failed to remove file at ${filePath}: ${error}`)
      }
    }

    await prisma.file.deleteMany({
      where: {
        id: { in: filesWithoutBacklinks.map(file => file.id) },
      },
    })

    const fileMount = `${runtimeConfig.fileMount}${relativeFileUploadDirectory}`
    const allFiles = await fs.promises.readdir(fileMount)

    const filesInDb = await prisma.file.findMany()

    if (allFiles.length === filesInDb.length) {
      logger.info(`Number of files in file mount matches number of files in database: files in db: ${filesInDb.length}, files in mount: ${allFiles.length}`)
      return { result: true }
    }
    logger.error("Number of files in file mount does not match number of files in database")

    const filesInDbPaths = new Set(filesInDb.map(file => file.path))

    for (const file of allFiles) {
      const relativeFilePath = `${relativeFileUploadDirectory}/${file}`
      const filePath = `${fileMount}/${file}`
      if (!filesInDbPaths.has(relativeFilePath)) {
        try {
          await fs.promises.unlink(filePath)
          logger.info(`Removed unlinked file at ${filePath}`)
        } catch (error) {
          logger.error(`Failed to remove unlinked file at ${filePath}: ${error}`)
        }
      }
    }

    return { result: true }
  },
})
