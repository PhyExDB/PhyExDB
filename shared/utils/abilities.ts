import type { FileList } from "~~/shared/types"

const isAdmin = (user: UserDetail) => user.role === "ADMIN"
const minModerator = (user: UserDetail) => user.role === "MODERATOR" || user.role === "ADMIN"
const onlyAdminAbility = defineAbility(false, isAdmin)
const noGuestsAbility = defineAbility(false, _ => true)

// legal

/** Ability to edit legal */
export const canEditLegal = onlyAdminAbility

// experiment
/** Ability to edit experiment */
export const canEditExperiment = defineAbility(
  false,
  (user, experiment: ExperimentList) => {
    return user.role === "ADMIN" || user.id === experiment.userId
  },
)

/** Ability to see experiment */
export const canSeeExperiment = defineAbility(true, (user: UserDetail, experiment: ExperimentList) => {
  return experiment.status === "PUBLISHED"
    || user.id === experiment.userId
    || (minModerator(user) && experiment.status === "IN_REVIEW")
})

/** Ability to create an experiment */
export const canCreateExperiment = noGuestsAbility

// experimentAttributes
/** Ability to edit Attributes */
export const canEditAttributes = onlyAdminAbility

// files
/** Ability to create file */
export const canCreateFile = defineAbility(false, (user: UserDetail) => {
  return user.emailVerified
})

/** Ability to delete a file */
export const canDeleteFile = defineAbility(false, (user: UserDetail, file: FileList) => {
  return user.id === file.createdById
})

// experimentFiles
/** Ability to create an experiment file */
export const canCreateExperimentFile = canEditExperiment

/** Ability to update an experiment file */
export const canUpdateExperimentFile = canEditExperiment

/** Ability to see an experiment file */
export const canSeeExperimentFile = canSeeExperiment

// userFiles
/** Ability to create a user file */
export const canCreateUserFile = defineAbility(false, (user: UserDetail, file: FileList) => {
  return user.id === file.createdById
})

/** Ability to delete a user file */
export const canDeleteUserFile = defineAbility(false, (user: UserDetail, userFile: UserFileDetail) => {
  return user.id === userFile.userId
})
