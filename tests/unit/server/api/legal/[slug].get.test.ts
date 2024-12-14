import { describe, expect, expectTypeOf, it, vi, vitest } from "vitest"
import type { H3Event, EventHandlerRequest } from "h3"
import getLegalDocument from "~~/server/api/legal/[slug].get" // Import your handler directly

vitest.mock("#imports", () => ({
  defineEventHandler: vi.fn(),
  getRouterParam: vi.fn(),
  defineRouteMeta: vi.fn(),
  getValidatedRouterParams: vi.fn(),
}))
// vitest.stubGlobal("defineEventHandler", (func: unknown) => func)
// vitest.stubGlobal("defineRouteMeta", (func: unknown) => func)
// vitest.stubGlobal("defineNitroPlugin", (e: unknown) => e)
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// vitest.stubGlobal("getValidatedRouterParams", (e: any, f: any) => f(e.context.params))

describe("Api Route /api/legal/{slug}", () => {
  it("should return a legal document when getting by slug", async () => {
    vitest.mock("getRouterParam", () => "privacy-policy")

    const documet: LegalDocumentDetail = {
      id: "1234",
      slug: "privacy-policy",
      name: "Privacy Policy",
      text: "This is the privacy policy",
    }
    vitest.mock("prisma.legalDocument.findFirst", () => documet)
    // Create mock event
    const event = {
      context: {
        params: {
          slug: "privacy-policy",
        },
      },
    } as unknown as H3Event<EventHandlerRequest>

    const response = await getLegalDocument(event)

    expectTypeOf(response).toEqualTypeOf<LegalDocumentDetail>()
    expect(response.id).toMatch(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    )
  })
})
