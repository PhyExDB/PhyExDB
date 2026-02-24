/**
 * Sorts experiment signs in a deterministic, domain-specific order.
 *
 * Sorting rules:
 * 1. WARNING signs first:
 *    - GHS (`ghs-*`, `gas-*`)
 *    - then other warning signs (`w*`)
 * 2. SAFETY signs (`m*`)
 * 3. Numeric / lexicographic order within the same group
 *
 * The original array is not mutated.
 *
 * @param signs - List of signs to sort
 * @returns A new array of signs sorted according to domain rules
 */
export function sortSigns(signs: Sign[]): Sign[] {
  return [...signs].sort((a, b) => {
    const pathA = a.iconPath ?? ""
    const pathB = b.iconPath ?? ""

    const getGroupPriority = (path: string): number => {
      if (path.startsWith("ghs-") || path.startsWith("gas-")) return 1
      if (path.startsWith("w")) return 2
      if (path.startsWith("m")) return 3
      return 99
    }

    const groupA = getGroupPriority(pathA)
    const groupB = getGroupPriority(pathB)

    if (groupA !== groupB) return groupA - groupB

    return pathA.localeCompare(pathB, undefined, { numeric: true, sensitivity: "base" })
  })
}
