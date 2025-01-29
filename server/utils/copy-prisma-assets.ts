import fs from "fs/promises"
import path from "path"
import type { Nitro } from "nitropack"

/**
 * Copy Prisma assets to the output directory of the Nitro build.
 * @param nitro Nitro instance.
 */
export async function copyPrismaAssets(nitro: Nitro) {
  // Copy Prisma schema and migrations to the output directory
  const prismaInDir = path.join(process.cwd(), "prisma")
  const prismaOutDir = path.join(nitro.options.output.dir, "prisma")
  await fs.cp(prismaInDir, prismaOutDir, { recursive: true })

  // Copy Prisma schema engine to the output directory
  const prismaEnginesInDir = path.join(process.cwd(), "node_modules", "@prisma", "engines")
  const prismaEnginesOutDir = path.join(nitro.options.output.serverDir, "node_modules", "@prisma", "engines")
  const prismaEnginesFiles = await fs.readdir(prismaEnginesInDir)
  for (const file of prismaEnginesFiles) {
    if (/^schema-engine-.+$/.test(file)) {
      await fs.cp(path.join(prismaEnginesInDir, file), path.join(prismaEnginesOutDir, file))
    }
  }
}
