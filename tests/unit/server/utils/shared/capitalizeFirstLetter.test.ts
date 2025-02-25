import { describe, expect, it } from "vitest"
import unit from "~~/shared/utils/capitalizeFirstLetter"

describe("Test shared capitalizeFirstLetter", async () => {
  it("capitalizeFirstLetter", () => {
    expect(unit("")).toBe("")
    expect(unit("john")).toBe("John")
    expect(unit("max musterman")).toBe("Max musterman")
    expect(unit("max müller musterman")).toBe("Max müller musterman")
    expect(unit(" ")).toBe(" ")
    expect(unit("HALO")).toBe("Halo")
    expect(unit("HALO WOrLd")).toBe("Halo world")
  })
})
