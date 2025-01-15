// https://github.com/Barbapapazes/nuxt-authorization

import type { Experiment } from "@prisma/client"

/**
 * Test ability to try it out
 */
export const forbiddenAbillity = defineAbility(_ => false)

/**
 * Test ability to try it out
 */
export const allowedAbillity = defineAbility({ allowGuest: true }, _ => true)

/**
 * Ability only by admin
 */
export const onlyAdminAbillity = defineAbility((user: UserDetail) => user.role === "ADMIN")

/**
 * Ability only signed in
 */
export const onlySignedInAbillity = defineAbility(_ => true)

/**
 * Ability to edit experiment
 */
export const canEditExperiment = defineAbility((user: UserDetail, experiment: Experiment) => {
  return user.role === "ADMIN" || user.id === experiment.userId
})

/**
 * Ability to see experiment
 */
export const canSeeExperiment = defineAbility({ allowGuest: true }, (user: UserDetail, experiment: Experiment) => {
  return experiment.status === "PUBLISHED"
    || user.id === experiment.userId
    || (minModerator(user.role) && experiment.status === "IN_REVIEW")
})

/**
 * Ability to create an experiment
 */
export const canCreateExperiment = onlySignedInAbillity

/**
 * Ability to create file
 */
export const canCreateFile = defineAbility((user: UserDetail) => {
  return user.emailVerified
})
/**
 * Ability to create an experiment file
 */
export const canCreateExperimentFile = canEditExperiment

/**
 * Ability to update an experiment file
 */
export const canUpdateExperimentFile = canEditExperiment

/**
 * Ability to see an experiment file
 */
export const canSeeExperimentFile = canSeeExperiment
