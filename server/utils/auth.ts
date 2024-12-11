import * as v from "valibot"
import jwt from "jsonwebtoken"
import type { H3Event, EventHandlerRequest } from "h3"
import type { AccessToken, Tokens } from "~~/shared/types/Auth"

const {
  refreshTokenSecret,
  accessTokenSecret,
  expSeccondsRefreshToken,
  expSeccondsAccessToken,
  expSeccondsSession,
} = useRuntimeConfig()

/**
 * Creates a new access token
 * @param {string} userId - The id of the user who requested the token
 * @returns {AccessToken} - A new access token
 */
export function createAccessToken(userId: string): AccessToken {
  const accessToken = jwt.sign({
    subject: userId,
    // username: user.username,
  }, accessTokenSecret, {
    expiresIn: expSeccondsAccessToken,
  })

  return {
    accessToken: accessToken,
  }
}

/**
 * Creates a new refresh token and a new access token
 * @param {string} sessionTokenId - The id of the session token which will be used for the refresh token
 * @param {string} userId - The id of the user who requested the token
 * @returns {Tokens} - A new refresh token and a new access token
 */
export function createTokens(sessionTokenId: string, userId: string): Tokens {
  const refreshToken = jwt.sign({
    subject: userId,
    token: sessionTokenId,
  }, refreshTokenSecret, {
    expiresIn: expSeccondsRefreshToken,
  })

  return {
    refreshToken: refreshToken,
    ...createAccessToken(userId),
  }
}

/**
 * Creates a new session and a new refresh token and a new access token
 * @param {string} userId - The id of the user who requested the token
 * @returns {Tokens} - A new refresh token and a new access token
 */
export async function createTokensOfNewSession(userId: string): Promise<Tokens> {
  const sessionToken = await prisma.sessionToken.create(
    {
      data: {
        session: {
          create: {
            userId: userId,
            exp: new Date((new Date()).getTime() + (expSeccondsSession * 1000)),
          },
        },
        valid: true,
        exp: new Date((new Date()).getTime() + (expSeccondsRefreshToken * 1000)),
      },
    },
  )

  const tokens = createTokens(sessionToken.id, userId)

  return tokens
}

/**
 * Error for invalid refresh token
 */
export const errorInvalidRefreshToken = createError({
  status: 401,
  message: "invalid refreshToken",
})

/**
 * Accepts a refresh token and returns the associated session if valid.
 *
 * This function verifies the provided refresh token, checks its validity,
 * and retrieves the corresponding session. If the refresh token is invalid,
 * already used, or expired, an error is thrown. Upon successful validation,
 * the session token is marked as invalid to prevent reuse, and the associated
 * session is returned.
 *
 * @param {string} refreshToken - The refresh token to be accepted.
 * @returns {Promise<Session>} - The session associated with the valid refresh token.
 * @throws {Error} - Throws an error if the refresh token is invalid or the session is not found.
 */
export async function acceptRefreshToken(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, refreshTokenSecret)
    if (typeof decoded === "string") {
      throw errorInvalidRefreshToken
    }

    authLogger.debug("decoded refreshToken")

    const sessionToken = await prisma.sessionToken.findFirst({
      where: {
        id: decoded.token,
      },
      include: {
        session: true,
      },
    })

    if (sessionToken === null) {
      authLogger.debug("SessionToken not found")
      throw errorInvalidRefreshToken
    }

    const session = sessionToken.session
    if (!sessionToken.valid) {
      prisma.session.delete({
        where: {
          id: session.id,
        },
      })
      authLogger.debug("RefreshToken used allready, Session got deleted")
      throw errorInvalidRefreshToken
    }

    // expiration of sessionToken gets checked by jwt
    if (session.exp < new Date()) {
      prisma.session.delete({
        where: {
          id: session.id,
        },
      })
      authLogger.debug("Session expired, got deleted")
      throw errorInvalidRefreshToken
    }
    authLogger.debug("found session")

    prisma.sessionToken.update({
      where: {
        id: sessionToken.id,
      },
      data: {
        valid: false,
      },
    })

    return session
  } catch (error) {
    consume(error)
    throw errorInvalidRefreshToken
  }
}

const refreshTokenSchema = v.object({
  refreshToken: v.string(),
})

/**
 * Accepts a refresh token and returns the associated session if valid.
 *
 * This function reads the body of the request and verifies the provided refresh token.
 * If the refresh token is invalid, already used, or expired, an error is thrown.
 * Upon successful validation, the session token is marked as invalid to prevent reuse,
 * and the associated session is returned.
 *
 * @param {H3Event<EventHandlerRequest>} event - The request containing the refresh token.
 * @returns {Promise<Session>} - The session associated with the valid refresh token.
 * @throws {Error} - Throws an error if the refresh token is invalid or the session is not found.
 */
export async function acceptRefreshTokenFromEvent(event: H3Event<EventHandlerRequest>) {
  const c = await readValidatedBody(event, body => v.parse(refreshTokenSchema, body))

  return await acceptRefreshToken(c.refreshToken)
}

/**
 * Error for invalid access token
 */
export const errorInvalidAccessToken = createError({
  status: 401,
  message: "invalid accessToken",
})
/**
 * Extracts the user associated with the given access token.
 *
 * If the access token is invalid, expired, or doesn't match a user, an error is thrown.
 *
 * @param {string} accessToken - The access token to verify.
 * @returns {Promise<User>} - The user associated with the valid access token.
 * @throws {Error} - Throws an error if the access token is invalid or the user is not found.
 */
export async function getUserFromAccessToken(accessToken: string) {
  try {
    const decoded = jwt.verify(accessToken, accessTokenSecret)
    authLogger.debug("decoded accessToken")
    if (typeof decoded === "string") {
      authLogger.debug("invalid accessToken: returned string")
      throw errorInvalidAccessToken
    }
    const userId = decoded.subject

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (user == null) {
      authLogger.debug("invalid accessToken: User not found")
      throw errorInvalidAccessToken
    }

    return user
  } catch (error) {
    authLogger.debug("invalid accessToken", error)
    throw errorInvalidAccessToken
  }
}
