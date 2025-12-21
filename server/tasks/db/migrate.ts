import { execSync } from "node:child_process"

export default defineTask({
  run: async () => {
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" })
      return { result: true }
    } catch (error) {
      return { result: false, error }
    }
  }
})