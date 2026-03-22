<script setup lang="ts">
defineProps<{
  setup: { secret: string }
  qrUrl: string | null
  qrLoading: boolean
  loading: boolean
}>()

const code = defineModel<string>("code")
const emit = defineEmits(["confirm"])
const secretVisible = ref(false)

async function copySecret(secret: string) {
  await navigator.clipboard.writeText(secret)
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid sm:grid-cols-[auto_1fr] gap-6 items-start">
      <div class="flex flex-col items-center gap-3">
        <div class="bg-white p-3 rounded-xl border shadow-sm relative">
          <div
            v-if="qrLoading"
            class="w-40 h-40 flex items-center justify-center"
          >
            <Icon
              name="lucide:loader-2"
              class="w-8 h-8 animate-spin text-muted-foreground"
            />
          </div>
          <img
            v-else-if="qrUrl"
            :src="qrUrl"
            alt="QR Code"
            class="w-40 h-40"
          >
        </div>
        <p class="text-xs text-muted-foreground text-center max-w-[160px]">
          Mit Authenticator-App scannen
        </p>
      </div>

      <div class="space-y-5">
        <div class="space-y-1.5">
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Manuelles Secret
          </p>
          <div class="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
            <span class="font-mono text-xs flex-1 truncate select-all">
              {{ secretVisible ? setup.secret : '••••••••••••••••' }}
            </span>
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              @click="secretVisible = !secretVisible"
            >
              <Icon
                :name="secretVisible ? 'heroicons:eye-slash' : 'heroicons:eye'"
                class="w-3.5 h-3.5"
              />
            </button>
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              @click="copySecret(setup.secret)"
            >
              <Icon
                name="heroicons:clipboard"
                class="w-3.5 h-3.5"
              />
            </button>
          </div>
        </div>

        <Separator />

        <div class="space-y-2">
          <p class="text-sm font-medium">
            Code bestätigen
          </p>
          <div class="flex gap-2">
            <input
              :value="code"
              placeholder="000000"
              maxlength="6"
              inputmode="numeric"
              autocomplete="one-time-code"
              :class="[
                'flex-1 h-10 rounded-md border bg-background px-3 text-center font-mono text-lg tracking-[0.3em] outline-none transition-colors',
                'focus:ring-2 focus:ring-ring focus:ring-offset-2 border-input',
              ]"
              @input="code = ($event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6)"
              @keydown.enter.prevent="emit('confirm')"
            >
            <Button
              :disabled="(code?.length ?? 0) < 6 || loading"
              @click="emit('confirm')"
            >
              <Icon
                v-if="loading"
                name="lucide:loader-2"
                class="w-4 h-4 mr-1 animate-spin"
              />
              Aktivieren
            </Button>
          </div>
          <p class="text-[11px] text-muted-foreground">
            6-stelligen Code aus deiner Authenticator-App eingeben
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
