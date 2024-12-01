import { umzugSeeds, performAction } from "./setup.js"

await performAction(() => umzugSeeds.up(), {
  successDescription: "Seeds executed:",
  failureDescription: "Seed failed:",
})
