/**
 * Test ability to try it out
 */
export const forbiddenAbillity = defineAbility(_ => false)
/**
 * Test ability to try it out
 */
export const testAbillity = defineAbility({ allowGuest: true }, _ => true)

// export const listPosts = defineAbility(() => true) // Only authenticated users can list posts

// export const editPost = defineAbility((user: User, post: Post) => {
//   return user.id === post.authorId
// })

// export const listPosts2 = defineAbility({ allowGuest: true }, (user: User | null) => true)
