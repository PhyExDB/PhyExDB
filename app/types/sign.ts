export type SignType = "WARNING" | "SAFETY"

export interface Sign {
  id: string
  name: string
  type: SignType
  iconPath: string
}
