/**
 * Converts a string into a URL-friendly slug.
 * @param input The string to be slugified.
 * @returns A slugified version of the input string.
 */
export default function slugify(input: string): string {
  if (!input) {
    return ""
  }

  return input
    .normalize("NFD") // Normalize to decompose accents (e.g., "é" to "e")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing spaces
    .replace(/[\s\W-]+/g, "-") // Replace spaces and non-word characters with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading and trailing hyphens
}
