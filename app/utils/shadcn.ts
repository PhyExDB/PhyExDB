import type { Updater } from "@tanstack/vue-table"
import type { Ref } from "vue"

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

/**
 * Updates the value of a given reference based on the provided updater function or value.
 */
export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  if (typeof updaterOrValue === "function") {
    ref.value = updaterOrValue(ref.value)
  } else {
    ref.value = updaterOrValue
  }
}
