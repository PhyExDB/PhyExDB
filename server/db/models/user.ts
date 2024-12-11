export const userResultExtensions = {
  toList: {
    needs: { id: true, username: true, role: true, verified: true },
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
  toDetail: {
    needs: { id: true, email: true, username: true, role: true, verified: true },
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
