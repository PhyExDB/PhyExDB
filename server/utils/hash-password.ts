import bcrypt from "bcrypt"

async function hash(password: string) {
  const salt = await bcrypt.genSalt()
  return await bcrypt.hash(password, salt)
}

export default hash
