import { umzug, performAction } from "./setup.js"

performAction(() => umzug.up(), {
  successDescription: "Migrations executed:",
  failureDescription: "Migration failed:",
})
