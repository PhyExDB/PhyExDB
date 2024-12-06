import * as v from "valibot"
import { Op } from "sequelize"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "~~/server/database/models/User"
import Session from "~~/server/database/models/Session"
import SessionToken from "~~/server/database/models/SessionToken"

const schema = v.object({
  refreshToken: v.string()
})

const error = createError({
  status: 401,
  message: "invalid refreshToken",
})

const config = useRuntimeConfig()

const refreshTokenSecret = config.refreshTokenSecret
const accessTokenSecret = config.accessTokenSecret
const expSeccondsSession = config.expSeccondsSession
const expSeccondsRefreshToken = config.expSeccondsRefreshToken
const expSeccondsAccessToken = config.expSeccondsAccessToken



export default defineEventHandler(async (event) => {
  const c = await readValidatedBody(event, body => v.parse(schema, body))

  const sessionToken = await SessionToken.findOne({
    where: {
      id: c.refreshToken,
    }
  })

  if (sessionToken === null) {
    throw error
  }

  const session = sessionToken.Session
  if (!sessionToken.valid){

    
    // todo delete session
    throw error
  }

  sessionToken.valid = false
  await sessionToken.save()

  const newSessionToken = await SessionToken.create(
    {
      session: session.id,
      exp: new Date((new Date()).getTime() + (expSeccondsRefreshToken * 1000)),
    },
  )



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
