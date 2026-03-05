<script setup lang="ts">
defineProps<{
  setup: { secret: string }
  qrUrl: string | null
  qrLoading: boolean
  loading: boolean
}>()

const code = defineModel<string>("code")
defineEmits(["confirm"])
</script>

<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div class="grid md:grid-cols-[auto_1fr] gap-8 items-start bg-muted/30 p-6 rounded-xl border border-dashed">
      <div class="flex flex-col items-center space-y-4">
        <div class="bg-white p-3 rounded-lg shadow-md ring-1 ring-black/5 dark:ring-white/10 relative">
          <div
            v-if="qrLoading"
            class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
          >
            <Icon
              name="heroicons:arrow-path"
              class="w-8 h-8 animate-spin text-primary"
            />
          </div>
          <img
            v-else-if="qrUrl"
            :src="qrUrl"
            alt="QR Code"
            class="w-40 h-40"
          >
        </div>
        <div class="text-center">
          <p class="text-[10px] uppercase font-bold text-muted-foreground mb-1">
            Manuelles Secret
          </p>
          <code class="text-xs px-2 py-1 bg-background border rounded font-mono">{{ setup.secret }}</code>
        </div>
      </div>

      <div class="space-y-5">
        <div class="space-y-2">
          <h4 class="font-bold text-sm flex items-center gap-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">1</span>
            App scannen
          </h4>
          <p class="text-xs text-muted-foreground">
            Scanne den QR-Code mit einer App wie Google Authenticator oder Ente Auth.
          </p>
        </div>

        <div class="space-y-3 border-t pt-4">
          <h4 class="font-bold text-sm flex items-center gap-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">2</span>
            Bestätigen
          </h4>
          <div class="flex gap-2">
            <Input
              v-model="code"
              placeholder="000000"
              class="font-mono tracking-[0.3em] text-center"
              maxlength="6"
            />
            <Button
              :loading="loading"
              @click="$emit('confirm')"
            >
              Aktivieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
