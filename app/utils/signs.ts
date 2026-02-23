import type { Sign } from "~~/shared/types/Sign.type"

/**
 * Returns the correct URL for a sign's icon.
 * Works for WARNING and SAFETY types.
 */
export function getSignIconUrl(sign: Sign): string {
  // If iconPath is already a relative path or contains folders, use as-is
  if (sign.iconPath.includes("/")) {
    return "/" + sign.iconPath
  }

  // Map by type
  switch (sign.type) {
    case "WARNING":
      return `/warning/${sign.iconPath}`
    case "SAFETY":
      return `/safety/${sign.iconPath}`
    default:
      return `/${sign.iconPath}`
  }
}
