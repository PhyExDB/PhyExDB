/**
 * Access token
*/
export interface AccessToken{
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