import type { Updater } from "@tanstack/vue-table"
import type { Ref } from "vue"

/* eslint-disable @typescript-eslint/no-explicit-any */

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
