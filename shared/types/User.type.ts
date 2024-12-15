import { z } from "zod"
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
  username:
    z.string().trim().min(1)
      .refine(
        value =>
          z.string().email().safeParse(value).success === false,
        { message: "Username can't be an email." },
      )
      .refine(
        value =>
          z.string().uuid().safeParse(value).success === false,
        { message: "Invalid username format" },
      ),
}

/**
 * Schema to verify email
 */
const emailSchema = {
  email:
    z.string().trim().min(1)
      .toLowerCase()
      .email(),
}

/**
 * Schema to verify password
 */
const passwordSchema = {
  password:
    z.string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
}

/**
 * Schema for user registration.
 * Combines the username, email, and password schemas into a single object schema.
 */
export const userRegisterSchema = z.object({
  ...usernameSchema,
  ...emailSchema,
  ...passwordSchema,
})

/**
 * Schema for user login.
 * Combines the username or email and password schemas into a single object schema.
 */
export const userLoginSchema = z.object({
  // usernameOrEmail:
  //   z.string().trim().min(1),
  ...emailSchema,
  password:
    z.string(),
})

/**
 * Schema for updating a user.
 * Combines the username and email schemas into a single object schema.
 */
export const userUpdateSchema = z.object({
  ...emailSchema,
})
