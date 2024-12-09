import * as v from "valibot"
import { Op } from "sequelize"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "~~/server/database/models/User"
import Session from "~~/server/database/models/Session"
import SessionToken from "~~/server/database/models/SessionToken"

const config = useRuntimeConfig()

const refreshTokenSecret = config.refreshTokenSecret
const accessTokenSecret = config.accessTokenSecret
const expSeccondsSession = config.expSeccondsSession
const expSeccondsRefreshToken = config.expSeccondsRefreshToken
const expSeccondsAccessToken = config.expSeccondsAccessToken



export default defineEventHandler(async (event) => {
  const session = await acceptRefreshTokenFromEvent(event)

  session.destroy()
})

defineRouteMeta({
  openAPI: {
    description: "logout",
    tags: ["Auth"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              refreshToken: { type: "string", format: "jwt" },
            },
            required: ["refreshToken"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "successfull",
      },
      400: {
        description: "Invalid body",
      },
      401: {
        description: "refreshToken invalid",
      },
    },
  },
})
