// https://github.com/Barbapapazes/nuxt-authorization

/**
 * Test ability to try it out
 */
export const forbiddenAbillity = defineAbility(_ => false)
/**
 * Test ability to try it out
 */
export const allowedAbillity = defineAbility({ allowGuest: true }, _ => true)

/**
 * Ability to edit experiment
 */
export const canEditExperiment = defineAbility((user: UserDetail, experiment: ExperimentList) => {
  return user.role === "Administrator" || user.id === experiment.userId
})
/**
 * Ability to see experiment
 */
export const canSeeExperiment = defineAbility({ allowGuest: true }, (user: UserDetail, experiment: ExperimentList) => {
  return experiment.status === "Accepted"
    || user.id === experiment.userId
    || (minModerator(user.role) && experiment.status === "Submitted")
})
