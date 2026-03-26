<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast"

const props = defineProps<{
  codes: string[]
}>()

const { toast } = useToast()
const config = useRuntimeConfig()
const copied = ref(false)

async function copyRecoveryCodes() {
  await navigator.clipboard.writeText(props.codes.join("\n"))
  copied.value = true
  toast({
    title: "Kopiert!",
    description: "Codes befinden sich in der Zwischenablage.",
    variant: "success",
  })
  setTimeout(() => (copied.value = false), 2000)
}

function downloadRecoveryCodes() {
  const appName = config.public.appName || "App"
  const date = new Date().toISOString().slice(0, 10)
  const filename = `2fa-recovery-codes-${appName}-${date}.txt`
  const blob = new Blob([props.codes.join("\n")], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  toast({
    title: "Download gestartet",
    variant: "success",
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3">
      <Icon
        name="heroicons:exclamation-triangle"
        class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
      />
      <p class="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
        Speichere diese Codes sicher. Jeder Code kann nur <strong>einmal</strong> verwendet werden und ist dein einziger Zugang, wenn du dein Gerät verlierst.
      </p>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="c in codes"
        :key="c"
        class="font-mono text-sm py-2 px-3 bg-muted/60 border border-border/60 rounded-md text-center tracking-widest select-all text-foreground"
      >
        {{ c }}
      </div>
    </div>

    <div class="flex gap-2">
      <Button
        variant="outline"
        class="flex-1 gap-2"
        @click="copyRecoveryCodes"
      >
        <Icon
          :name="copied ? 'heroicons:check' : 'heroicons:clipboard'"
          class="w-4 h-4"
        />
        {{ copied ? 'Kopiert!' : 'Kopieren' }}
      </Button>
      <Button
        variant="outline"
        class="flex-1 gap-2"
        @click="downloadRecoveryCodes"
      >
        <Icon
          name="heroicons:arrow-down-tray"
          class="w-4 h-4"
        />
        Speichern
      </Button>
    </div>
  </div>
</template>
