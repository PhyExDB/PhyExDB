import crypto from "node:crypto"
import { generateTOTP, verifyTOTP, getTOTPAuthUri } from "@epic-web/totp"

const DEFAULT_STEP = Number(process.env.TWOFA_STEP ?? 30)
const DEFAULT_DIGITS = Number(process.env.TWOFA_DIGITS ?? 6)
const ISSUER = process.env.TWOFA_ISSUER ?? (process.env.NUXT_PUBLIC_APP_NAME ?? "App")
const COOKIE_SECRET = process.env.TWOFA_COOKIE_SECRET ?? "change-me"

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

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex")
}

export function hashRecoveryCode(code: string): string {
  const salt = crypto.randomBytes(8).toString("hex")
  const hash = sha256(`${salt}:${code}`)
  return `${salt}:${hash}`
}

export function verifyRecoveryCode(code: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const cand = sha256(`${salt}:${code}`)
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(cand, "hex"))
}

export function signTwofaCookie(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const payload = Buffer.from(JSON.stringify({ sub: userId, iat: Math.floor(Date.now() / 1000) })).toString("base64url")
  const data = `${header}.${payload}`
  const sig = crypto.createHmac("sha256", COOKIE_SECRET).update(data).digest("base64url")
  return `${data}.${sig}`
}

export function verifyTwofaCookie(token: string, userId: string): boolean {
  try {
    const [header, payload, sig] = token.split(".")
    if (!header || !payload || !sig) return false
    const expected = crypto.createHmac("sha256", COOKIE_SECRET).update(`${header}.${payload}`).digest("base64url")
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
    const body = JSON.parse(Buffer.from(payload, "base64url").toString())
    return body.sub === userId
  } catch {
    return false
  }
}
