import * as v from "valibot"
import { validate as uuidValidate } from "uuid"
import type { BaseList } from "./Base.type"

/**
 * Type for the role of a user
 */
export type UserRole = "USER" | "MODERATOR" | "ADMIN"

/**
 * Represents a list of users with their ids, usernames, roles, and verification statuses.
 * Extends the BaseList interface.
 */
export interface UserList extends BaseList {
  /**
   * The id of the user.
   */
  id: string
  /**
   * The username of the user.
   */
  username: string
  /**
   * The role of the user.
   */
  role: UserRole
  /**
   * Whether the user has emailVerified their account.
   */
  emailVerified: boolean
}

/**
 * Represents a user with their id, username, role, email, and verification status.
 */
export interface UserDetail extends UserList {
  /**
   * The email of the user.
   */
  email: string
}

/**
 * Schema to verify username
 */
const usernameSchema = {
  username: v.pipe(
    v.string(),
    v.nonEmpty("Please enter Name"),
    v.check(
      value =>
        !v.is(v.pipe(
          v.string(),
          v.email(""),
        ), value),
      "Username can't be an email."),
    v.check(name => !uuidValidate(name), "Invalid username format"),
  ),
}

/**
 * Schema to verify email
 */
const emailSchema = {
  email: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your email."),
    v.email("The email is badly formatted."),
  ),
}

/**
 * Schema to verify password
 */
const passwordSchema = {
  password: v.pipe(
    v.string(),
    v.nonEmpty("Please enter Password"),
    v.minLength(8, "Password must be at least 8 characters"),
    v.regex(/[a-z]/, "Password must contain at least one lowercase letter"),
    v.regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
    v.regex(/[0-9]/, "Password must contain at least one number"),
  ),
}

/**
 * Schema for user registration.
 * Combines the username, email, and password schemas into a single object schema.
 */
export const userRegisterSchema = v.object({
  ...usernameSchema,
  ...emailSchema,
  ...passwordSchema,
})

/**
 * Schema for user login.
 * Combines the username or email and password schemas into a single object schema.
 */
export const userLoginSchema = v.object({
  usernameOrEmail: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your username or email."),
  ),
  password: v.string(),
})

/**
 * Schema for updating a user.
 * Combines the username and email schemas into a single object schema.
 */
export const userUpdateSchema = v.object({
  ...usernameSchema,
  ...emailSchema,
})
