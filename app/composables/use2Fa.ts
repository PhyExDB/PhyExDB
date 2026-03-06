import { useToast } from "~/components/ui/toast";

/**
 * Bestimmt das Navigationsziel basierend auf dem 2FA-Status.
 * @param status Der aktuelle TwoFactorStatus
 * @param currentPath Der aktuelle Pfad (um Endlosschleifen zu vermeiden)
 * @returns Das Ziel-Pfad-String oder null, wenn keine Aktion erforderlich ist
 */
export function getTwoFaRedirectTarget(
  status: TwoFactorStatus,
  currentPath: string = ""
): string | null {
  if (!status.authenticated) {
    return "/login"
  }

  if (!status.enabled) {
    if (currentPath.startsWith("/2fa/setup")) return null
    return "/2fa/setup"
  }

  if (!status.verified) {
    if (currentPath.startsWith("/2fa/challenge")) return null
    const redirectParam = currentPath && currentPath !== "/"
      ? `?redirect=${encodeURIComponent(currentPath)}`
      : ""
    return `/2fa/challenge${redirectParam}`
  }

  return null
}

export const use2fa = () => {
  const status = useState<TwoFactorStatus | null>('2fa-status', () => null)
  const loading = ref(false)
  const { toast } = useToast()

  const refreshStatus = async () => {
    const data = await $fetch<TwoFactorStatus>("/api/2fa/status", {
      params: { t: Date.now() }
    })
    status.value = data
    return data
  }

  const handleError = (e: any, title = "Fehler") => {
    const message = e.data?.statusMessage || e.data?.message || e.message || "Ein unbekannter Fehler ist aufgetreten."
    toast({ title, description: message, variant: "destructive" })
    console.error(`[2FA Error]: ${title}`, e)
  }

  return { status, loading, refreshStatus, handleError }
}

