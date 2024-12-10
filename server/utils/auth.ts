import * as v from "valibot"
import jwt from "jsonwebtoken"
import type { H3Event, EventHandlerRequest } from "h3"
import User from "~~/server/database/models/User"
import Session from "~~/server/database/models/Session"
import SessionToken from "~~/server/database/models/SessionToken"
import type { AccessToken, Tokens } from "~~/shared/types/Auth"

const { refreshTokenSecret, accessTokenSecret, expSeccondsRefreshToken, expSeccondsAccessToken } = useRuntimeConfig()

export function createAccessToken(userId: string): AccessToken {
  const accessToken = jwt.sign({
    // username: user.username,
  }, accessTokenSecret, {
    subject: userId,
    expiresIn: expSeccondsAccessToken,
  })

  return {
    accessToken: accessToken,
  }
}

export function createTokens(sessionTokenId: string, userId: string): Tokens {
  const refreshToken = jwt.sign({
    token: sessionTokenId,
  }, refreshTokenSecret, {
    subject: userId,
    expiresIn: expSeccondsRefreshToken,
  })

  return {
    refreshToken: refreshToken,
    ...createAccessToken(userId),
  }
}

export const errorInvalidRefreshToken = createError({
  status: 401,
  message: "invalid refreshToken",
})

export async function acceptRefreshToken(refreshToken: string): Promise<Session> {
  try {
    const decoded = jwt.verify(refreshToken, refreshTokenSecret)
    if (typeof decoded === "string") {
      throw errorInvalidRefreshToken
    }

    authLogger.debug("decoded refreshToken")

    const sessionToken = await SessionToken.findOne({
      where: {
        id: decoded.token,
      },
      include: {
        model: Session,
      },
    })

    if (sessionToken === null) {
      authLogger.debug("SessionToken not found")
      throw errorInvalidRefreshToken
    }

    const session = sessionToken.Session
    if (!sessionToken.valid) {
      session.destroy()
      authLogger.debug("RefreshToken used allready, Session got deleted")
      throw errorInvalidRefreshToken
    }

    // expiration of sessionToken gets checked by jwt
    if (session.exp < new Date()) {
      session.destroy()
      authLogger.debug("Session expired, got deleted")
      throw errorInvalidRefreshToken
    }
    authLogger.debug("found session")

    sessionToken.valid = false
    await sessionToken.save()

    return session
  } catch (_) {
    throw errorInvalidRefreshToken
  }
}

const refreshTokenSchema = v.object({
  refreshToken: v.string(),
})

export async function acceptRefreshTokenFromEvent(event: H3Event<EventHandlerRequest>): Promise<Session> {
  const c = await readValidatedBody(event, body => v.parse(refreshTokenSchema, body))

  return await acceptRefreshToken(c.refreshToken)
}

export const errorInvalidAccessToken = createError({
  status: 401,
  message: "invalid accessToken",
})
export async function getUserFromAccessToken(accessToken: string): Promise<User> {
  try {
    const decoded = jwt.verify(accessToken, accessTokenSecret)
    if (typeof decoded === "string") {
      throw errorInvalidAccessToken
    }
    const userId = decoded.subject

    const user = await User.findOne({
      where: {
        id: userId,
      },
    })
    if (user == null) {
      throw errorInvalidAccessToken
    }

    return user
  } catch (_) {
    throw errorInvalidAccessToken
  }
}
