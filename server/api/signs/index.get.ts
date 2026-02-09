import type { Sign } from "~/types/sign"
import { SIGNS } from "~/utils/constants/signs"

export default defineEventHandler(() =>
  SIGNS.map(
    (sign): Sign => ({
      id: sign.filename.replace(/\s+/g, "_"),
      name: sign.name,
      type: sign.category.toUpperCase() as "WARNING" | "SAFETY",
      iconPath: `/uploads/${sign.category}/${sign.filename}`,
    }),
  ),
)
