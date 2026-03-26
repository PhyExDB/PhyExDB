/**
 * Represents the global authentication and 2FA state for a user.
 */
export interface TwoFactorStatus {
  /** Indicates if the user has a valid active session.
   * If `false`: Redirect to `/login`.
   */
  authenticated: boolean

  /** Indicates if the user has completed the 2FA setup process.
   * If `false` (and authenticated is `true`): Redirect to `/2fa/setup`.
   */
  enabled: boolean

  /** Indicates if the current session is fully verified via a 2FA code or recovery key.
   * If `false` (and enabled is `true`): Redirect to `/2fa/challenge`.
   */
  verified: boolean
}
