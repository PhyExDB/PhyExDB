import { umzug, performAction } from "./setup.js"

await performAction(() => umzug.down(), {
  successDescription: "Migrations reverted:",
  failureDescription: "Revert failed:",
})
