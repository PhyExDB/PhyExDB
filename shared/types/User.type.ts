import { z, type UnknownKeysParam } from "zod"
import type { BaseList } from "./Base.type"

/**
 * Type for the role of a user
 */
export type UserRole = "USER" | "MODERATOR" | "ADMIN"

/**
 * Represents a list of users with their ids, names, roles, and verification statuses.
 * Extends the BaseList interface.
 */
export interface UserList extends BaseList {
  /**
   * The id of the user.
   */
  id: string
  /**
   * The name of the user.
   */
  name: string
  /**
   * The role of the user.
   */
  role: UserRole
  /**
   * Whether the user has emailVerified their account.
   */
  emailVerified: boolean
}

/**
 * Represents a user with their id, name, role, email, and verification status.
 */
export interface UserDetail extends UserList {
  /**
   * The email of the user.
   */
  email: string
}

/**
 * Represents a user with their id, name, role, email, and verification status.
 */
export interface UserDetailAdmin extends UserDetail {
  /**
   * If the user is banned.
   */
  banned: boolean
}

/**
 * Schema to verify the user name
 */
export const nameSchema = {
  name:
    z.string({ required_error: "Nutzername muss angegeben werden" })
      .trim()
      .nonempty("Nutzername muss angegeben werden")
      .refine(
        value =>
          z.string().email().safeParse(value).success === false,
        { message: "Nutzername darf keine E-Mail-Adresse sein" },
      )
      .refine(
        value =>
          z.string().uuid().safeParse(value).success === false,
        { message: "Invalider Nutzername" },
      ),
}

/**
 * Schema to verify email
 */
export const emailSchema = {
  email:
    z.string({ required_error: "E-Mail-Adresse muss angegeben werden" })
      .trim()
      .nonempty("E-Mail-Adresse muss angegeben werden")
      .toLowerCase()
      .email("Invalide E-Mail-Adresse"),
}

/**
 * Schema to verify password
 */
export const passwordSchema = {
  password:
    z.string({ required_error: "Passwort muss angegeben werden" })
      .nonempty("Passwort muss angegeben werden")
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
      .regex(/[a-z]/, "Passwort muss mindestens einen Kleinbuchstaben enthalten")
      .regex(/[A-Z]/, "Passwort muss mindestens einen Grossbuchstaben enthalten")
      .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten"),
}

const confirmPasswordSchema = {
  confirmPassword: z.string({ required_error: "Passwort muss wiederholt werden" }),
}

/**
 * Schema for user registration.
 * Combines the name, email, and password schemas into a single object schema.
 */
export const userRegisterSchema = z.object({
  ...nameSchema,
  ...emailSchema,
  ...passwordSchema,
})

/**
 * Schema for user registration with repeat password.
 */
const userRegisterSchemaWithRepeatPassword = z.object({
  ...userRegisterSchema.shape,
  ...confirmPasswordSchema,
  acceptedTermsOfService: z.literal(
    true,
    { message: "Die Nutzungsbedingungen müssen akzeptiert werden." },
  ),
})

/**
 * Validates that the password and confirmPassword fields match.
 *
 * Workaround, see https://github.com/colinhacks/zod/issues/479#issuecomment-2429834215
 */
const validatePasswordForSchema = <
  T extends z.ZodObject<
    { password: z.ZodString, confirmPassword: z.ZodString } & z.ZodRawShape,
    UnknownKeysParam,
    z.ZodTypeAny
  >,
>(
  schema: T,
) =>
  z.preprocess((input, ctx) => {
    // Assert that input is an object
    if (typeof input !== "object" || input === null) {
      return input // Let the schema handle non-object inputs
    }

    // Validate only the password and confirmPassword fields
    const parsed = z
      .object({
        password: z.string(),
        confirmPassword: z.string(),
      })
      .safeParse(input)

    // Check if passwords match
    if (parsed.success && parsed.data.password !== parsed.data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwörter stimmen nicht überein",
      })
    }

    // Return the input to allow further schema validation
    return input
  }, schema)

/**
 * Schema for user registration with repeat password.
 * Also validates that the password and confirmPassword fields match.
 */
export const userRegisterSchemaWithRepeatValidatePassword
  = validatePasswordForSchema(userRegisterSchemaWithRepeatPassword)

/**
 * Schema for user login.
 * Combines the name or email and password schemas into a single object schema.
 */
export const userLoginSchema = z.object({
  ...emailSchema,
  password: z.string({ required_error: "Passwort muss angegeben werden" })
    .nonempty("Passwort muss angegeben werden"),
})

/**
 * Schema for updating a user.
 * Combines the name and email schemas into a single object schema.
 */
export const userUpdateSchema = z.object({
  ...nameSchema,
  ...emailSchema,
})

/**
 * Schema for updating a user's password.
 */
const userUpdatePasswordSchema = z.object({
  oldPassword: z.string({ required_error: "Altes Passwort muss angegeben werden" })
    .nonempty("Altes Passwort muss angegeben werden"),
  ...passwordSchema,
  ...confirmPasswordSchema,
})

/**
 * Validates that the password and confirmPassword fields match.
 */
export const userUpdatePasswordValidateSchema = validatePasswordForSchema(userUpdatePasswordSchema)

const userResetPasswordSchema = z.object({
  ...passwordSchema,
  ...confirmPasswordSchema,
})

export const userResetPasswordValidateSchema = validatePasswordForSchema(userResetPasswordSchema)
