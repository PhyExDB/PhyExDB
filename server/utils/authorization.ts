import type { Event } from "./utils"
import { getUser, getUserOrThrowError } from "./auth"
import type { Ability, UserAbility } from "~~/shared/utils/auth"
import { evaluateAbility, evaluateUserAbility } from "~~/shared/utils/auth"
import prisma from "../lib/prisma"
import { verifyTwofaCookie } from "~~/server/utils/twofa"

/* eslint-disable @typescript-eslint/no-explicit-any */

async function ensureTwofaIfRequired(event: Event, user: UserDetail | null): Promise<void> {
  const enabledGlobally = (process.env.TWOFA_ENABLED ?? "true").toLowerCase() !== "false"
  if (!enabledGlobally) return
  if (!user) return
  // Allow 2FA API routes without enforcement
  const path = event.path || ""
  if (path.startsWith("/api/2fa")) return
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { twoFactorEnabled: true } })
  if (!record?.twoFactorEnabled) return
  const cookies = parseCookies(event)
  const token = cookies["twofa_verified"]
  const verified = token ? verifyTwofaCookie(token, user.id) : false
  if (!verified) {
    throw createError({ statusCode: 401, statusMessage: "2FA required" })
  }
}

/**
 * Authorizes a user based on the provided ability and parameters.
 */
export async function authorize<T extends any[]>(
  event: Event,
  ability: Ability<T>,
  ...param: T
): Promise<UserDetail | null> {
  const user = await getUser(event)
  const result = evaluateAbility(user, ability, ...param)
  if (result === "Not logged in") {
    throw createError({ statusCode: 401, statusMessage: "Not logged in" })
  } else if (result === "Not authorized") {
    throw createError({ statusCode: 403, statusMessage: "Not authorized" })
  }
  await ensureTwofaIfRequired(event, user)
  return result
}
/**
 * Authorizes a user based on the provided UserAbility and parameters.
 * Can't be used with abillities allowing guests to prevent the strengthening of requirements.
 */
export async function authorizeUser<T extends any[]>(
  event: Event,
  ability: UserAbility<T>,
  ...param: T
): Promise<UserDetail> {
  const user = await getUserOrThrowError(event)
  const result = evaluateUserAbility(user, ability, ...param)
  if (result === "Not authorized") {
    throw createError({ statusCode: 403, statusMessage: "Not authorized" })
  }
  await ensureTwofaIfRequired(event, user)
  return result
}
