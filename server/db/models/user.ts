/**
 * An object containing extensions for user result transformations.
 */
export const userResultExtensions = {
  /**
   * Extension to transform a user object to a list format.
   */
  toList: {
    /**
     * Specifies the properties required from the user object.
     */
    needs: {
      id: true,
      username: true,
      role: true,
      verified: true,
    },
    /**
     * Computes the list format of the user object.
     *
     * @param user - The user object containing the required properties.
     * @returns A function that returns the user object in list format.
     */
    compute(user: { id: string, username: string, role: string, verified: boolean }) {
      return () => {
        return {
          id: user.id,
          username: user.username,
          role: user.role,
          verified: user.verified,
        }
      }
    },
  },
  /**
   * Extension to transform a user object to a detailed format.
   */
  toDetail: {
    /**
     * Specifies the properties required from the user object.
     */
    needs: {
      id: true,
      email: true,
      username: true,
      role: true,
      verified: true,
    },
    /**
     * Computes the detailed format of the user object.
     *
     * @param user - The user object containing the required properties.
     * @returns A function that returns the user object in detailed format.
     */
    compute(user: { id: string, email: string, username: string, role: string, verified: boolean }) {
      return () => {
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          verified: user.verified,
        }
      }
    },
  },
}
