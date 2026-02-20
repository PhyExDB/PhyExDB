<script setup lang="ts">
import type { Sign } from "~/types/sign"

/**
 * Props for SignGrid component.
 */
const props = defineProps<{
  modelValue: Sign[]
  availableSigns: Sign[] | undefined
}>()

/**
 * Emits for SignGrid component.
 */
const emit = defineEmits<{
  /**
   * Emitted when the user selects or deselects a sign.
   * Sends the updated array of sign IDs.
   */
  (e: "update:modelValue", value: { id: string }[]): void
}>()

/**
 * Computed array of warning signs filtered from availableSigns.
 */
const warningSigns = computed(() =>
  props.availableSigns?.filter(s => s.type === "WARNING") ?? [],
)

/**
 * Computed array of safety signs filtered from availableSigns.
 */
const safetySigns = computed(() =>
  props.availableSigns?.filter(s => s.type === "SAFETY") ?? [],
)

/**
 * Checks if a given sign is currently selected.
 * @param sign - The sign to check.
 * @returns `true` if the sign is selected, `false` otherwise.
 */
function isSelected(sign: Sign) {
  return props.modelValue.some(s => s.id === sign.id)
}

/**
 * Toggles the selection state of a sign.
 * If the sign is already selected, it will be removed.
 * If it is not selected, it will be added.
 * @param sign - The sign to toggle.
 */
function toggleSign(sign: Sign) {
  const exists = isSelected(sign)

  if (exists) {
    emit(
      "update:modelValue",
      props.modelValue.filter(s => s.id !== sign.id),
    )
  } else {
    emit(
      "update:modelValue",
      [...props.modelValue, { id: sign.id }],
    )
  }
}
</script>

<template>
  <div class="space-y-10">
    <!-- Loading state -->
    <div v-if="!props.availableSigns">
      Lade Schilder…
    </div>

    <div v-else>
      <!-- WARNZEICHEN -->
      <section>
        <h3 class="text-lg font-semibold mb-4">
          Warnzeichen
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          <button
            v-for="sign in warningSigns"
            :key="sign.id"
            type="button"
            class="flex flex-col items-center text-xs rounded-lg p-3 transition-all duration-150 focus:outline-none"
            :class="isSelected(sign)
              ? 'bg-primary/10 ring-2 ring-primary'
              : 'hover:bg-muted'"
            @click="toggleSign(sign)"
          >
            <!-- Square container -->
            <div class="w-16 h-16 flex items-center justify-center mb-2">
              <img
                :src="sign.iconPath"
                :alt="sign.name"
                class="max-w-full max-h-full object-contain"
              >
            </div>

            <span class="text-center leading-tight">
              {{ sign.name }}
            </span>
          </button>
        </div>
      </section>

      <!-- SCHUTZZEICHEN -->
      <section class="mt-10">
        <h3 class="text-lg font-semibold mb-4">
          Schutzzeichen
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          <button
            v-for="sign in safetySigns"
            :key="sign.id"
            type="button"
            class="flex flex-col items-center text-xs rounded-lg p-3 transition-all duration-150 focus:outline-none"
            :class="isSelected(sign)
              ? 'bg-primary/10 ring-2 ring-primary'
              : 'hover:bg-muted'"
            @click="toggleSign(sign)"
          >
            <div class="w-16 h-16 flex items-center justify-center mb-2">
              <img
                :src="sign.iconPath"
                :alt="sign.name"
                class="max-w-full max-h-full object-contain"
              >
            </div>

            <span class="text-center leading-tight">
              {{ sign.name }}
            </span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
