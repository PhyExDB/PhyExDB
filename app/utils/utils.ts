import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges multiple class names into a single string.
 *
 * This function takes any number of class name inputs, processes them using `clsx`,
 * and then merges them using `twMerge` to ensure Tailwind CSS classes are combined correctly.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
