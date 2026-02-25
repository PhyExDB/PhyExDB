/**
 * Represents the category of a sign.
 *
 * - `"WARNING"` – Indicates a potential hazard or danger to be aware of.
 * - `"SAFETY"` – Provides safety instructions or precautionary information.
 */
export type SignType = "WARNING" | "SAFETY"

/**
 * Represents a sign with a visual icon and associated metadata.
 */
export interface Sign {
  /** Unique identifier for the sign. */
  id: string
  /** Human-readable display name of the sign. */
  name: string
  /** The category of the sign, either a warning or a safety notice. */
  type: SignType
  /** File path or URL to the sign's icon image. */
  iconPath: string
}
