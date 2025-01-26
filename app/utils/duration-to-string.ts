/**
 * Converts a duration in minutes to a string representation in hours and minutes.
 *
 * @param minutes - The duration in minutes to be converted.
 * @returns A string representing the duration in hours and minutes.
 *          For example, 125 minutes would be converted to "2 h 5 min".
 */
export function durationToMinAndHourString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours > 0 ? `${hours} h ` : ""}${remainingMinutes > 0 ? `${remainingMinutes} min` : ""}`
}
