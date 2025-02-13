import { describe, expect, it } from "vitest"

import slugify from "~~/server/utils/slugify"

describe("Test utils slugify", async () => {
    it("slugify", () => {
        expect(slugify("Hello World")).toBe("hello-world")
        expect(slugify("AAA ä")).toBe("aaa-a")
    })
})
