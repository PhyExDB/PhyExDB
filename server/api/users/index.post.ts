/**
 * Handles the creation of a new user.
 *
 * This function validates the incoming user data against a predefined schema
 * and creates a new user in the database if the validation is successful.
 *
 * @param {Event} event - The event object representing the HTTP request.
 *
 * @throws {Error} Throws an error if the user data is invalid.
 *
 * @returns {Object} An object containing a success message and the newly created user.
 */
import * as v from "valibot"
import { createError, readValidatedBody } from "h3"
import Users from "~~/server/database/models/User"

export default defineEventHandler(async (event) => {
  // Validate user data
  const userSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty("Please enter Name")),
    email: v.pipe(v.string(), v.nonEmpty("Please enter Email"), v.email("Not an Email")),
    password: v.pipe(v.string(), v.nonEmpty("Please enter Password"), v.minLength(8, "Password must be at least 8 characters"), v.regex(/[a-z]/, "Password must contain at least one lowercase letter"), v.regex(/[A-Z]/, "Password must contain at least one uppercase letter"), v.regex(/[0-9]/, "Password must contain at least one number")),
  })

  // This is a helper function that reads the body and validates it against the schema
  const newUserContent = await readValidatedBody(event, body => v.parse(userSchema, body))
  const validation = v.safeParse(userSchema, newUserContent)
  if (!validation.success) {
    throw createError({ status: 400, message: "Invalid user data" })
  }

  // Create new user
  const newUser = await Users.create(newUserContent)

  return {
    message: "User created successfully",
    user: newUser,
  }
})

defineRouteMeta({
  openAPI: {
    description: "Creates a new user",
    tags: ["users", "creation"],
    requestBody: {
      description: "User data",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              password: { type: "string" },
            },
            required: ["name", "email", "password"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "User created successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
                user: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
      },
      400: {
        description: "Invalid user data",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statusCode: { type: "number" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
})
