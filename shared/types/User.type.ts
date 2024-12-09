import type { BaseList } from "./Base.type"
import Prisma from "@prisma/client"

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
  role: string
  /**
   * Whether the user has verified their account.
   */
  verified: boolean
}
export const toUserList = (user: Prisma.User): UserList => {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    verified: user.verified,
  }
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
 * Represents an update to a user
 */
export interface UserUpdate {
  /**
   * The username of the user.
   */
  username: string
  /**
   * The email of the user.
   */
  email: string
}

/**
 * Interface representing the data required to create a new user.
 */
export interface UserCreate {
  /**
   * The username of the user.
   */
  username: string
  /**
  * The email of the user.
  */
  email: string
  /**
   * The password of the user.
   */
  password: string
}
