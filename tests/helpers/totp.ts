import { generateTOTP } from "@epic-web/totp"

/**
 * Generates a current TOTP code for a given base32 secret.
 *
 * Note: Node.js Web Crypto requires the algorithm name with a hyphen ("SHA-1"),
 * while some TOTP libraries default to "SHA1" (without hyphen), which throws
 * `NotSupportedError: Unrecognized algorithm name`.
 */
export async function generateTotpCode(secret: string): Promise<string> {
  const { otp } = await generateTOTP({
    secret,
    period: 30,
    digits: 6,
    algorithm: "SHA-1",
  })
  return otp
}
