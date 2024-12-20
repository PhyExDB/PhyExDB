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

export const editLegalDocumentAbillity = defineAbility((user: UserDetail) => {
  return minRole(UserRole.Admin, user)
})

/**
 * Ability only signed in
 */
export const onlySignedInAbillity = defineAbility(_ => true)
/**
 * Ability to edit experiment
 */
export const canEditExperiment = defineAbility((user: UserDetail, experiment: ExperimentList) => {
  return minRole(UserRole.Moderator, user) || user.id === experiment.userId
})
/**
 * Ability to see experiment
 */
export const canSeeExperiment = defineAbility({ allowGuest: true }, (user: UserDetail, experiment: ExperimentList) => {
  return experiment.status === "Accepted"
    || user.id === experiment.userId
    || (minModerator(user.role) && experiment.status === "Submitted")
})
