import { UserRole } from "~~/shared/types/User.type"
// https://github.com/Barbapapazes/nuxt-authorization

/**
 * Checks if a given role is at least a moderator.
 *
 * @param role the role to check
 * @returns true if the role is Moderator or Administrator, false otherwise
 */
export function minRole(minRole: UserRole, user: UserDetail): boolean {
  return user.role >= minRole
}
/**
 * Checks if the given user has an admin role.
 *
 * @param user - The user details to check.
 * @returns `true` if the user is an admin, otherwise `false`.
 */
export function isAdmin(user: UserDetail): boolean {
  return user.role === UserRole.Admin
}
/**
 * Checks if the user has at least a Moderator role.
 *
 * @param user - The details of the user to check.
 * @returns `true` if the user's role is Moderator or higher, otherwise `false`.
 */
export function minModerator(user: UserDetail): boolean {
  return user.role >= UserRole.Moderator
}

/**
 * Defines the ability for a user to edit legal documents.
 */
export const editLegalDocumentAbillity = defineAbility(isAdmin)

/**
 * Ability to edit experiment
 */
export const canEditExperiment = defineAbility((user: UserDetail, experiment: ExperimentList) => {
  return minModerator(user) || user.id === experiment.userId
})
/**
 * Ability to see experiment
 */
export const canSeeExperiment = defineAbility({ allowGuest: true }, (user: UserDetail, experiment: ExperimentList) => {
  return experiment.status === "Accepted"
    || user.id === experiment.userId
    || (minModerator(user) && experiment.status === "Submitted")
})
