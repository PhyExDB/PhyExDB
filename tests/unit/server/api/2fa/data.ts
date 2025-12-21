import { users } from "~~/tests/helpers/auth"

/**
 * Mock user with 2FA enabled
 */
export const userWith2faEnabled = {
  ...users.user,
  twoFactorEnabled: true,
  twoFactorSecret: "JBSWY3DPEHPK3PXP",
  twoFactorRecoveryCodes: ["$2b$10$hashedcode1", "$2b$10$hashedcode2"],
}

/**
 * Mock user with 2FA disabled
 */
export const userWith2faDisabled = {
  ...users.user,
  twoFactorEnabled: false,
  twoFactorSecret: null,
  twoFactorRecoveryCodes: [],
}

/**
 * Mock user with 2FA secret but not yet enabled (setup in progress)
 */
export const userWith2faSetupInProgress = {
  ...users.user,
  twoFactorEnabled: false,
  twoFactorSecret: "JBSWY3DPEHPK3PXP",
  twoFactorRecoveryCodes: [],
}

/**
 * Mock 2FA status responses
 */
export const statusEnabled = { enabled: true, required: true }
export const statusDisabled = { enabled: false, required: false }

/**
 * Mock enable response with recovery codes
 */
export const enableResponse = {
  recoveryCodes: [
    "ABCDE-12345",
    "FGHIJ-67890",
    "KLMNO-11111",
    "PQRST-22222",
    "UVWXY-33333",
    "ZABCD-44444",
    "EFGHI-55555",
    "JKLMN-66666",
    "OPQRS-77777",
    "TUVWX-88888",
  ],
}

/**
 * Mock challenge response
 */
export const challengeSuccess = { verified: true }

/**
 * Mock disable response
 */
export const disableSuccess = { disabled: true }

/**
 * Mock recoveries response
 */
export const recoveriesResponse = {
  recoveryCodes: [
    "NEWCD-11111",
    "NEWCD-22222",
    "NEWCD-33333",
    "NEWCD-44444",
    "NEWCD-55555",
    "NEWCD-66666",
    "NEWCD-77777",
    "NEWCD-88888",
    "NEWCD-99999",
    "NEWCD-00000",
  ],
}
