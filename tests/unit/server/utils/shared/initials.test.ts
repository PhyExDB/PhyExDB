import { describe, expect, it } from "vitest"
import getInitials from "~~/shared/utils/initials"

describe("Test shared initials", async () => {
  it("getInitials", () => {
    expect(getInitials("")).toBe("")
    expect(getInitials("John")).toBe("JO")
    expect(getInitials("Max Musterman")).toBe("MM")
    expect(getInitials("Max Müller Musterman")).toBe("MMM")
  })
})
