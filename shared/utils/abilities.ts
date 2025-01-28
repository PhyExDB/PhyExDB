import type { ExperimentList, UserDetail } from "~~/shared/types"

// selects the fields that should be able to influence the authorization
type User = Pick<UserDetail, "id" | "role" | "emailVerified">
type Experiment = Pick<ExperimentList, "userId" | "status">
type File = { createdById: string }
type ExperimentFile = { experimentSection: { experiment: Experiment } }
type UserFile = { userId: string | null }

type CRUD<T> = {
  getAll?: Ability<[]> // warning: logic often is in db request instead
  post?: Ability<[]>
  get?: Ability<[T]>
  put?: Ability<[T]>
  delete?: Ability<[T]>
}

const isAdmin = (user: UserDetail) => user.role === "ADMIN"
const minModerator = (user: User) => user.role === "MODERATOR" || user.role === "ADMIN"
const onlyAdminAbility = defineAbility(false, isAdmin)
const noGuestsAbility = defineAbility(false, _ => true)
const everyoneAbility = defineAbility(true, _ => true)
function abillityRequiringUserId<T>(extractUserId: (t: T) => string) {
  return defineAbility(false, (user, t: T) => user.id === extractUserId(t))
}

const onlyAdminCRUD = {
  getAll: onlyAdminAbility,
  get: onlyAdminAbility,
  put: onlyAdminAbility,
  delete: onlyAdminAbility,
  post: onlyAdminAbility,
} satisfies CRUD<never>

const everyoneSeeAdminEditCRUD = {
  getAll: everyoneAbility,
  get: everyoneAbility,
  put: onlyAdminAbility,
  delete: onlyAdminAbility,
  post: onlyAdminAbility,
} satisfies CRUD<never>

export const userAbilities = onlyAdminCRUD

/** Abilities for legal */
export const legalAbilities = everyoneSeeAdminEditCRUD

/** Abilities for experimentAttributes */
export const experimentAttributeAbilities = everyoneSeeAdminEditCRUD

/** Abilities for experimentAttributeValues */
export const experimentAttributeValueAbilities = everyoneSeeAdminEditCRUD

/** Abilities for experimentSections */
export const experimentSectionAbilities = everyoneSeeAdminEditCRUD

/** Abilities for experiments */
export const experimentAbilities = {
  get: {
    func: (user, experiment) =>
      experiment.status === "PUBLISHED"
      || user.id === experiment.userId
      || (minModerator(user) && experiment.status === "IN_REVIEW"),
    allowGuests: true,
  },
  put: {
    func: (user, experiment) => user.role === "ADMIN" || user.id === experiment.userId,
    allowGuests: false,
  },
  post: noGuestsAbility,
} satisfies CRUD<Experiment>

/** Abilities for files */
export const fileAbilities = {
  post: {
    func: user => user.emailVerified,
    allowGuests: false,
  },
  delete: {
    func: (user, file) => user.id === file.createdById,
    allowGuests: false,
  },
} satisfies CRUD<File>

/** Abilities for experimentFiles */
export const experimentFileAbilities = {
  post: experimentAbilities.put satisfies Ability<[Experiment]>,
  put: abilityMapFunction(
    experimentAbilities.put,
    f => (u, e) => f(u, e.experimentSection.experiment),
  ) satisfies Ability<[ExperimentFile]>,
  get: abilityMapFunction(
    experimentAbilities.get,
    f => (u, e) => f(u, e.experimentSection.experiment),
  ) satisfies Ability<[ExperimentFile]>,
}

/** Abilities for userFiles */
export const userFileAbilities = {
  post: abillityRequiringUserId(file => file.createdById) satisfies Ability<[File]>,
  delete: {
    func: (user, userFile) => userFile.userId != null && user.id === userFile.userId,
    allowGuests: false,
  } satisfies Ability<[UserFile]>,
}
