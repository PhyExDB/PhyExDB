<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast"

const props = defineProps<{
  codes: string[]
}>()

const { toast } = useToast()
const config = useRuntimeConfig()

function copyRecoveryCodes() {
  const text = props.codes.join("\n")
  navigator.clipboard.writeText(text)
  toast({
    title: "Kopiert!",
    description: "Codes befinden sich in der Zwischenablage.",
    variant: "success",
  })
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
  <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
    <div class="space-y-4 text-center">
      <div class="space-y-1">
        <h4 class="text-sm font-bold uppercase tracking-tight">
          Wiederherstellungscodes
        </h4>
        <p class="text-[11px] text-muted-foreground leading-relaxed">
          Sichere diese Codes an einem geschützten Ort. Wenn du den Zugriff auf deine App verlierst, sind diese Codes dein einziger Zugang.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2 mt-4 text-left">
        <div
          v-for="c in codes"
          :key="c"
          class="font-mono text-xs p-2.5 bg-muted/50 border rounded-md text-center shadow-sm select-all"
        >
          {{ c }}
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 pt-2">
        <Button
          variant="outline"
          class="flex-1"
          @click="copyRecoveryCodes"
        >
          <Icon
            name="heroicons:clipboard"
            class="mr-2 h-4 w-4"
          />
          Kopieren
        </Button>
        <Button
          variant="outline"
          class="flex-1"
          @click="downloadRecoveryCodes"
        >
          <Icon
            name="heroicons:arrow-down-tray"
            class="mr-2 h-4 w-4"
          />
          Speichern (.txt)
        </Button>
      </div>
    </div>
  </div>
</template>
