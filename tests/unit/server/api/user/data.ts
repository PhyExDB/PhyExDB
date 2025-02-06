import { users } from "~~/tests/helpers/auth"

/**
 * An array of ressource lists
 */
export const detail: UserDetail = users.user

/**
 * A resource detail
 */
export const lists: UserDetailAdmin[] = (Object.values(users)
  .filter(user => user !== null)
  .map(user =>
    ({ ...user, banned: false }),
  )
)
