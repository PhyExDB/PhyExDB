<script setup lang="ts">
import type { Sign } from "~/types/sign"

const props = defineProps<{
  modelValue: Sign[]
  availableSigns: Sign[] | undefined
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: Sign[]): void
}>()

const warningSigns = computed(() =>
  props.availableSigns?.filter(s => s.type === "WARNING") ?? [],
)

const safetySigns = computed(() =>
  props.availableSigns?.filter(s => s.type === "SAFETY") ?? [],
)

function toggleSign(sign: Sign) {
  const exists = props.modelValue.some(s => s.id === sign.id)

  if (exists) {
    emit(
      "update:modelValue",
      props.modelValue.filter(s => s.id !== sign.id),
    )
  } else {
    emit(
      "update:modelValue",
      [...props.modelValue, sign],
    )
  }
}

function isSelected(sign: Sign) {
  return props.modelValue.some(s => s.id === sign.id)
}
</script>

<template>
  <div class="space-y-8">
    <div v-if="!props.availableSigns">
      Lade Schilder…
    </div>

    <div v-else>
      <section>
        <h3 class="text-lg font-semibold mb-3">
          Warnzeichen:
        </h3>

        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="sign in warningSigns"
            :key="sign.id"
            class="flex flex-col items-center text-xs cursor-pointer rounded p-2"
            :class="isSelected(sign)
              ? 'bg-primary/10 ring-2 ring-primary'
              : 'hover:bg-muted'"
            @click="toggleSign(sign)"
          >
            <img
              :src="sign.iconPath"
              :alt="sign.name"
              class="w-12 h-12"
            >
            <span class="mt-1 text-center">{{ sign.name }}</span>
          </div>
        </div>
      </section>

      <section class="mt-8">
        <h3 class="text-lg font-semibold mb-3">
          Schutzzeichen:
        </h3>

        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="sign in safetySigns"
            :key="sign.id"
            class="flex flex-col items-center text-xs cursor-pointer rounded p-2"
            :class="isSelected(sign)
              ? 'bg-primary/10 ring-2 ring-primary'
              : 'hover:bg-muted'"
            @click="toggleSign(sign)"
          >
            <img
              :src="sign.iconPath"
              :alt="sign.name"
              class="w-12 h-12"
            >
            <span class="mt-1 text-center">{{ sign.name }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
