export default function getInitials(name: string): string {
  // Split the name into parts by spaces
  const nameParts = name.trim().split(/\s+/)

  if (nameParts.length === 0) {
    // If there are no parts, return an empty string
    return ""
  } else if (nameParts.length === 1) {
    // If there is only one part, return the first two letters, uppercased
    return nameParts[0]!.slice(0, 2).toUpperCase()
  } else {
    // If there are multiple parts, return the first letter of each part, uppercased
    return nameParts.slice(0, 3).map(part => part[0]!.toUpperCase()).join("")
  }
}
