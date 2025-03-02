import path from "path"
import fs from "fs"
import { exec } from "child_process"
import { promisify } from "util"
import type { File, FileDetail } from "~~/shared/types"
import { fileAbilities } from "~~/shared/utils/abilities"
import { authorizeUser } from "~~/server/utils/authorization"

/**
 * The directory where the files are stored relative to the public directory
 */
export const relativeFileUploadDirectory = "/uploads"

const execAsync = promisify(exec)

async function convertMovToMp4(inputPath: string, outputPath: string) {
  await execAsync(
    `ffmpeg -i "${inputPath}" -vcodec h264 -acodec aac "${outputPath}"`,
  )
  // Delete the original .mov file
  fs.unlinkSync(inputPath)
}

export default defineEventHandler(async (event) => {
  const user = await authorizeUser(event, fileAbilities.post)

  const { files } = await readBody<{ files: File[] }>(event)

  const newFiles: FileDetail[] = []

  for (const file of files) {
    const newRelativeFileLocation = await storeFileLocally(
      file,
      12,
      relativeFileUploadDirectory,
    )
    const newFileLocation = `${relativeFileUploadDirectory}/${newRelativeFileLocation}`

    let finalFilePath = newFileLocation

    if (file.type === "video/quicktime") {
      const inputPath = path.join("public", newFileLocation)
      const outputPath = inputPath.replace(/\.mov$/, ".mp4")
      file.type = "video/mp4"

      try {
        // Perform the conversion in the background
        event.waitUntil(convertMovToMp4(inputPath, outputPath))
        finalFilePath = outputPath.replace("public", "")
      } catch (error) {
        console.error("Error converting .mov to .mp4:", error)
      }
    }

    const dbFile = await prisma.file.create({
      data: {
        path: finalFilePath,
        originalName: file.name,
        mimeType: file.type,
        createdBy: { connect: { id: user.id } },
      },
      include: {
        createdBy: true,
      },
    })

    newFiles.push(dbFile as FileDetail)
  }

  setResponseStatus(event, 201)
  return newFiles
})

defineRouteMeta({
  openAPI: {
    description: "Upload one or multiple files",
    tags: ["Files"],
    requestBody: {
      content: {
        "": {
          schema: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
    responses: {
      200: {
        description: "The file has been uploaded",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                originalName: { type: "string" },
                path: { type: "string" },
                mimeType: { type: "string" },
                createdById: { type: "string", format: "uuid" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                createdBy: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    role: { type: "string", enum: ["ADMIN", "MODERATOR", "USER"] },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    emailVerified: { type: "boolean" },
                    image: { type: "string" },
                    banned: { type: "boolean" },
                    banReason: { type: "string" },
                    banExpiresAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
    },
  },
})
