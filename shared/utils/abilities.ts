import type { ExperimentList, UserDetail } from "~~/shared/types"

// selects the fields that should be able to influence the authorization
type User = Pick<UserDetail, "id" | "role" | "emailVerified">
type Experiment = Pick<ExperimentList, "userId" | "status">
type File = { createdById: string | null }
type ExperimentFile = { experimentSection: { experiment: Experiment } }
type UserFile = { userId: string | null }
type Comment = { userId: string | null, experiment: { userId: string | null } | null }

type CRUD<T> = {
  getAll?: Ability<[]> // warning: logic often is in db request instead
  post?: Ability<[]>
  get?: Ability<[T]>
  put?: Ability<[T]>
  delete?: Ability<[T]>
}

function notNull<T>(a: T | null) {
  return a !== null
}
const isAdmin = (user: UserDetail | null) => notNull(user) && user.role === "ADMIN"
const minModerator = (user: User | null) => notNull(user) && (user.role === "MODERATOR" || user.role === "ADMIN")
const verified = (user: User | null) => notNull(user) && user.emailVerified
const everyone = defineAbility(_ => true)
function userId<T>(extractUserId: (t: T) => string | null) {
  return defineAbility((user, t: T) => user?.id === extractUserId(t))
}
function adminOrUserId<T>(extractUserId: (t: T) => string | null) {
  return defineAbility((user, t: T) => isAdmin(user) || user?.id === extractUserId(t))
}

const isAdminCRUD = {
  getAll: isAdmin,
  get: isAdmin,
  put: isAdmin,
  delete: isAdmin,
  post: isAdmin,
} satisfies CRUD<never>

const everyoneSeeAdminEditCRUD = {
  getAll: everyone,
  get: everyone,
  put: isAdmin,
  delete: isAdmin,
  post: isAdmin,
} satisfies CRUD<never>

export const userAbilities = isAdminCRUD

/** Abilities for legal */
export const legalAbilities = everyoneSeeAdminEditCRUD

/** Abilities for experimentAttributes */
export const experimentAttributeAbilities = everyoneSeeAdminEditCRUD

/** Abilities for experimentAttributeValues */
export const experimentAttributeValueAbilities = everyoneSeeAdminEditCRUD

export const experimentCommentAbilities = {
  getAll: everyone,
  post: (user: UserDetail | null, _: Experiment) => 
    notNull(user) && (
      user.emailVerified
    ),
  delete: ((user: UserDetail | null, comment: Comment) => 
    notNull(user) && (
      isAdmin(user)
      || user.id === comment.experiment?.userId 
      || user.id === comment.userId
    )
  ),
}

/** Abilities for experimentSections */
export const experimentSectionAbilities = everyoneSeeAdminEditCRUD

/** Abilities for experiments */
export const experimentAbilities = {
  get: (user, experiment) =>
    experiment.status === "PUBLISHED"
    || (
      notNull(user) && (
        user.id === experiment.userId
        || (minModerator(user) && experiment.status === "IN_REVIEW")
      )
    ),
  put: (user, experiment) => notNull(user) && (
    user.role === "ADMIN" || user.id === experiment.userId
  ),
  post: verified,
  listOwn: notNull,
  review: minModerator,
  rate: verified,
  delete: adminOrUserId(experiment => experiment.userId),
} satisfies CRUD<Experiment>
& { listOwn?: Ability<[]> }
& { review?: Ability<[]> }
& { rate?: Ability<[]> }

/** Abilities for files */
export const fileAbilities = {
  post: verified,
  delete: userId(file => file.createdById),
} satisfies CRUD<File>

/** Abilities for experimentFiles */
export const experimentFileAbilities = {
  post: (
    experimentAbilities.put
  ) satisfies Ability<[Experiment]>,
  put: (
    (user, expFile) => experimentAbilities.put(user, expFile.experimentSection.experiment)
  ) satisfies Ability<[ExperimentFile]>,
  get: (
    (user, expFile) => experimentAbilities.get(user, expFile.experimentSection.experiment)
  ) satisfies Ability<[ExperimentFile]>,
}

/** Abilities for userFiles */
export const userFileAbilities = {
  post: userId(file => file.createdById) satisfies Ability<[File]>,
  delete: userId(userFile => userFile.userId) satisfies Ability<[UserFile]>,
}
