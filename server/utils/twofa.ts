import crypto from "node:crypto"
import { generateTOTP, verifyTOTP, getTOTPAuthUri } from "@epic-web/totp"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const DEFAULT_STEP = Number(process.env.TWOFA_STEP ?? 30)
const DEFAULT_DIGITS = Number(process.env.TWOFA_DIGITS ?? 6)
const ISSUER = process.env.TWOFA_ISSUER ?? (process.env.NUXT_PUBLIC_APP_NAME ?? "App")
if (!process.env.TWOFA_COOKIE_SECRET) {
  throw new Error("TWOFA_COOKIE_SECRET must be set")
}

const COOKIE_SECRET = process.env.TWOFA_COOKIE_SECRET

export async function generateSecret(): Promise<string> {
  const { secret } = await generateTOTP({ period: DEFAULT_STEP, digits: DEFAULT_DIGITS })
  return secret
}

export async function verifyTotp(
  code: string,
  secret: string,
  opts?: { step?: number; digits?: number; window?: number },
): Promise<boolean> {
  const period = opts?.step ?? DEFAULT_STEP
  const digits = opts?.digits ?? DEFAULT_DIGITS
  const window = opts?.window ?? 1
  const result = await verifyTOTP({ otp: code, secret, period, digits, window })
  return result !== null
}

export function buildOtpauthUrl({
  secret,
  accountName,
  issuer = ISSUER,
  digits = DEFAULT_DIGITS,
  period = DEFAULT_STEP,
}: {
  secret: string
  accountName: string
  issuer?: string
  digits?: number
  period?: number
}): string {
  return getTOTPAuthUri({
    secret,
    accountName,
    issuer,
    digits,
    period,
    algorithm: "SHA-1",
  })
}

export function generateRecoveryCodes(count = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(5).toString("hex").slice(0, 10).toUpperCase()
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5)}`)
  }
  return codes
}

export function hashRecoveryCode(code: string): string {
  return bcrypt.hashSync(normalizeRecoveryCode(code), 10)
}

export function verifyRecoveryCode(code: string, stored: string): boolean {
  try {
    return bcrypt.compareSync(normalizeRecoveryCode(code), stored)
  } catch {
    return false
  }
}

export function isTwofaGloballyEnabled(): boolean {
  return (process.env.TWOFA_ENABLED ?? "true").toLowerCase() !== "false"
}

export function signTwofaCookie(userId: string): string {
  return jwt.sign({ user_id: userId }, COOKIE_SECRET, { algorithm: "HS256", expiresIn: "12h" })
}

export function verifyTwofaCookie(token: string, userId: string): boolean {
  try {
    const decoded = jwt.verify(token, COOKIE_SECRET, { algorithms: ["HS256"] }) as { sub?: string }
    return decoded.sub === userId
  } catch {
    return false
  }
}

function normalizeRecoveryCode(code: string): string {
  return code.replace(/[\s-]/g, "").toUpperCase()
}
