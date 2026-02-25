import type { Sign } from "~~/shared/types/Sign.type"

/**
 * Returns the correct URL for a sign's icon.
 * Works for WARNING and SAFETY types.
 */
export function getSignIconUrl(sign: Sign): string {
  let path = sign.iconPath

  if (!path.includes("/")) {
    switch (sign.type) {
      case "WARNING":
        path = `warning/${path}`
        break
      case "SAFETY":
        path = `safety/${path}`
        break
    }
  }

  return `/${path.replace(/^\/+/, "")}`
}
