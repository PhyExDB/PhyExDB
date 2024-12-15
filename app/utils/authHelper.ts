/**
 * getUser
 */
export async function getUser() {
  const { data: session } = await authClient.useSession(useFetch)
  const user = session?.value?.user
  return user
}
