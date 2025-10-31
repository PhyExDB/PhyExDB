import crypto from "node:crypto"

const DEFAULT_STEP = Number(process.env.TWOFA_STEP ?? 30)
const DEFAULT_DIGITS = Number(process.env.TWOFA_DIGITS ?? 6)
const ISSUER = process.env.TWOFA_ISSUER ?? (process.env.NUXT_PUBLIC_APP_NAME ?? "App")
const COOKIE_SECRET = process.env.TWOFA_COOKIE_SECRET ?? "change-me"

function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  let bits = 0
  let value = 0
  let output = ""
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]
    bits += 8
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31]
  }
  return output
}

function base32Decode(str: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  const lookup: Record<string, number> = {}
  for (let i = 0; i < alphabet.length; i++) lookup[alphabet[i]] = i
  let bits = 0
  let value = 0
  const bytes: number[] = []
  const clean = str.toUpperCase().replace(/=+$/g, "")
  for (let i = 0; i < clean.length; i++) {
    const idx = lookup[clean[i]]
    if (idx === undefined) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

export function generateSecret(length = 20): string {
  return base32Encode(crypto.randomBytes(length))
}

function timeCounter(step = DEFAULT_STEP, timestamp = Date.now()): number {
  return Math.floor(timestamp / 1000 / step)
}

function hotp(secret: string, counter: number, digits = DEFAULT_DIGITS): string {
  const key = base32Decode(secret)
  const counterBuf = Buffer.alloc(8)
  counterBuf.writeBigUint64BE(BigInt(counter))
  const hmac = crypto.createHmac("sha1", key).update(counterBuf).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  return ((hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits).toString().padStart(digits, "0")
}

export function totp(secret: string, step = DEFAULT_STEP, digits = DEFAULT_DIGITS, timestamp = Date.now()): string {
  return hotp(secret, timeCounter(step, timestamp), digits)
}

export function verifyTotp(code: string, secret: string, opts?: { step?: number; digits?: number; window?: number; timestamp?: number }): boolean {
  const step = opts?.step ?? DEFAULT_STEP
  const digits = opts?.digits ?? DEFAULT_DIGITS
  const window = opts?.window ?? 1
  const ts = opts?.timestamp ?? Date.now()
  const ctr = timeCounter(step, ts)
  for (let w = -window; w <= window; w++) {
    if (hotp(secret, ctr + w, digits) === code) return true
  }
  return false
}

export function buildOtpauthUrl({ secret, accountName, issuer = ISSUER, digits = DEFAULT_DIGITS, period = DEFAULT_STEP }: { secret: string; accountName: string; issuer?: string; digits?: number; period?: number }): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`)
  const params = new URLSearchParams({ secret, issuer, digits: String(digits), period: String(period) })
  return `otpauth://totp/${label}?${params.toString()}`
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
