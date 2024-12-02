import type { BaseList } from "./Base.type"

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
  verified: string
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
   * The content of the legal document.
   */
  role: string
  /**
   * The role of the user.
   */
  verified: string
  /**
   * The verification status of the user.
   */
  email: string
  /**
   * The email of the user.
   */
}
