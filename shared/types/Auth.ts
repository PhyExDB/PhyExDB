import type { UserDetail } from "./User.type"

/**
 * Access token
*/
export interface AccessToken {
  /**
     * Access token
     */
  accessToken: string
}

/**
 * Tokens
 */
export interface Tokens extends AccessToken {
  /**
     * Refresh token
     */
  refreshToken: string
}

/**
 * Tokens with user detail
 */
export interface TokensWithUserDetail extends Tokens {
  /**
   * User detail
   */
  user: UserDetail
}
