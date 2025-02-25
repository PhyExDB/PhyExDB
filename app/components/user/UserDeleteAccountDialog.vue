<script lang="ts" setup>
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { ref } from "vue"
import { z } from "zod"
import { useToast } from "@/components/ui/toast/use-toast"

const loading = ref(false)
const open = ref(false)
const confirmDelete = ref(false)

const formSchema = toTypedSchema(
  z.object({
    password: z.string().min(1, "Passwort erforderlich"),
  }),
)
const form = useForm({ validationSchema: formSchema })

const { toast } = useToast()
const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true
  let hasError = false

  const { error } = await useAuth().client.deleteUser({
    password: values.password,
    callbackURL: "/login",
  })

  if (error?.code === "INVALID_PASSWORD") {
    hasError = true
    form.setFieldError("password", "Das Passwort ist falsch")
  }

  if (error?.code === "CANNOT_DELETE_THE_LAST_ADMIN_USER") {
    toast({
      title: "Account nicht gelöscht",
      description: "Der letzte Admin Account kann nicht gelöscht werden.",
      variant: "error",
    })
    open.value = false
    return
  }

  if (!hasError) {
    toast({
      title: "Account gelöscht",
      description: "Dein Account wurde erfolgreich gelöscht.",
      variant: "success",
    })
    open.value = false
  }

  open.value = hasError
  loading.value = false
})

const _confirmDeletion = () => {
  confirmDelete.value = true
}

const _cancelDeletion = () => {
  confirmDelete.value = false
}

const openForm = (event: boolean) => {
  open.value = event
  if (event) {
    form.resetForm()
  }
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="openForm"
  >
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="max-w-[425px] max-h-full overflow-auto">
      <DialogHeader>
        <DialogTitle>Account löschen</DialogTitle>
        <DialogDescription>
          Lösche deinen PHYEXDB Account.
        </DialogDescription>
      </DialogHeader>
      <form
        class="grid gap-4"
        @submit="onSubmit"
      >
        <FormField
          v-slot="{ field: componentField }"
          name="password"
        >
          <FormItem>
            <FormLabel>Passwort</FormLabel>
            <FormControl>
              <Input
                id="password"
                v-bind="componentField"
                type="password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <DialogFooter>
          <Button
            variant="destructive"
            @click="onSubmit"
          >
            Löschen
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
