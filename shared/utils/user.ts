/**
 * Checks if a given role is at least a moderator.
 *
 * @param role the role to check
 * @returns true if the role is Moderator or Administrator, false otherwise
 */
export function minModerator(role: "User" | "Moderator" | "Administrator"): boolean {
  return role === "Moderator" || role === "Administrator"
}
