import { describe, it, expect } from "vitest"
import { sanitizeHTML } from "~~/server/utils/dompurify"

describe("sanitizeHTML", () => {
  it("removes unsafe elements", () => {
    const unsafeHtml = "<div>Hello</div><script>alert(\"XSS\")</script>"
    const result = sanitizeHTML(unsafeHtml)

    expect(result).toBe("<div>Hello</div>") // Script should be removed
  })

  it("keeps safe elements intact", () => {
    const safeHtml = "<h1>Title</h1><p>Content</p>"
    const result = sanitizeHTML(safeHtml)

    expect(result).toBe(safeHtml) // Safe HTML remains unchanged
  })
})
