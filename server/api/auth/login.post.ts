import * as v from "valibot"
import { Op } from "sequelize"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "~~/server/database/models/User"
import Session from "~~/server/database/models/Session"
import SessionToken from "~~/server/database/models/SessionToken"

const schema = v.object({
  usernameOrEmail: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your email."),
  ),
  password: v.string(),
})

const error = createError({
  status: 401,
  message: "Username, email or password wrong",
})

const config = useRuntimeConfig()

const refreshTokenSecret = config.refreshTokenSecret
const accessTokenSecret = config.accessTokenSecret
const expSeccondsSession = config.expSeccondsSession
const expSeccondsRefreshToken = config.expSeccondsRefreshToken
const expSeccondsAccessToken = config.expSeccondsAccessToken

export default defineEventHandler(async (event) => {
  const c = await readValidatedBody(event, body => v.parse(schema, body))

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { username: c.usernameOrEmail },
        { email: c.usernameOrEmail },
      ],
    },
  })

  if (user == null) {
    authLogger.debug("User not found", { usernameOrEmail: c.usernameOrEmail })
    throw error
  }
  const match = bcrypt.compareSync(c.password, user.passwordHash)
  if (!match) {
    authLogger.debug("Password does not match")
    throw error
  }

  const sessionToken = await SessionToken.create(
    {
      Session: {
        sub: user.id,
        exp: new Date((new Date()).getTime() + (expSeccondsSession * 1000)),
      },
      valid: true,
      exp: new Date((new Date()).getTime() + (expSeccondsRefreshToken * 1000)),
    }, 
    {
      include: ["Session"],
    }
  )
  const session = sessionToken.Session

  // const session = await Session.create({
  //   sub: user.id,
  //   exp: new Date((new Date()).getTime() + (expSeccondsSession * 1000)),
  // })

  // const sessionToken = await SessionToken.create({
  //   session: session.id,
  //   exp: new Date((new Date()).getTime() + (expSeccondsRefreshToken * 1000)),
  // })

  const refreshToken = jwt.sign({
    token: sessionToken.id,
  }, refreshTokenSecret, {
    subject: user.id,
    expiresIn: expSeccondsRefreshToken,
  })

  const accessToken = jwt.sign({
    // username: user.username,
  }, accessTokenSecret, {
    subject: user.id,
    expiresIn: expSeccondsAccessToken,
  })

  return { refreshToken: refreshToken, accessToken: accessToken }
})

defineRouteMeta({
  openAPI: {
    description: "Login User",
    tags: ["Auth"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              usernameOrEmail: { type: "string" },
              password: { type: "string" },
            },
            required: ["usernameOrEmail", "password"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "login successfull",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                refreshToken: { type: "string", format: "jwt" },
                accessToken: { type: "string", format: "jwt" },
              },
              required: ["refreshToken", "accessToken"],
            },
          },
        },
      },
      400: {
        description: "Invalid body",
      },
      401: {
        description: "Username, email or password wrong",
      },
    },
  },
})
