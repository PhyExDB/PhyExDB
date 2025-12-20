/**
 * Shared test setup for 2FA tests
 * This file contains common mocks and utilities used across all 2FA tests
 */
import { vi } from "vitest"

/**
 * Setup all H3 mocks - call this at module level before tests run
 */
export function setupH3Mocks() {
    vi.mock("h3", async (importOriginal) => {
        const actual = await importOriginal() as object
        return {
            ...actual,
            parseCookies: vi.fn().mockReturnValue({}),
            setCookie: vi.fn(),
            deleteCookie: vi.fn(),
            readBody: vi.fn().mockResolvedValue({ code: "123456" }),
            createError: vi.fn().mockImplementation((opts) => {
                const error = new Error(opts.statusMessage || opts.message) as Error & { statusCode:  number }
                error.statusCode = opts.statusCode
                return error
            }),
            defineEventHandler: vi.fn().mockImplementation((handler) => handler),
            getRouterParams: vi.fn().mockReturnValue({}),
            getQuery: vi.fn().mockReturnValue({}),
            setResponseStatus: vi.fn(),
        }
    })
}

/**
 * Update readBody mock for specific body content
 */
export async function mockReadBody(body:  object) {
    const h3 = await import("h3")
    vi.mocked(h3.readBody).mockResolvedValue(body)
}

/**
 * Update parseCookies mock with specific cookies
 */
export async function mockParseCookies(cookies: Record<string, string>) {
    const h3 = await import("h3")
    vi.mocked(h3.parseCookies).mockReturnValue(cookies)
}