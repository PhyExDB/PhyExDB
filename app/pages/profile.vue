<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { emailSchema } from "~~/shared/types/User.type"

definePageMeta({
  title: "Profile",
  description: "Change your information",
})

const user = await useUser()

const loading = ref(false)
const knownMails: string[] = []

const schema = z.object({
  ...emailSchema,
  ...usernameSchema,
}).partial()

const form = useForm({ validationSchema: toTypedSchema(schema) })

const onSubmit = form.handleSubmit(async (values) => {
  if (user.value) {
    if (values.email && values.email !== user.value.email) {
      console.log("email changed")
      authClient.changeEmail({
        newEmail: values.email,
      })
      const input = document.getElementById("email") as HTMLInputElement
      input.value = ""
    }
    if (values.username && values.username !== user.value.username) {
      console.log("username changed")
      authClient.updateUser({
        name: values.username,
      })
      const input = document.getElementById("username") as HTMLInputElement
      input.value = ""
    }
  }
})

// authClient.changePassword({
//     newPassword: "newPassword123",
//     currentPassword: "oldPassword123",
//     revokeOtherSessions: true, // revoke all other sessions the user is signed into
// });
</script>

<template>
  <div v-if="user">
    emailVerified: {{ user.emailVerified }}
    <Button v-if="user.emailVerified">
      E-Mail Verifizieren
    </Button>

    <form
      class="w-2/3 space-y-6"
      @submit="onSubmit"
    >
      <FormField
        v-slot="{ componentField }"
        name="email"
      >
        <FormItem>
          <FormLabel>E-mail</FormLabel>
          <FormControl>
            <Input
              id="email"
              v-bind="componentField"
              type="email"
              :placeholder="user.email"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField
        v-slot="{ componentField }"
        name="username"
      >
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input
              id="username"
              v-bind="componentField"
              type="string"
              :placeholder="user.username"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button
        :loading="loading"
        type="submit"
      >
        Submit
      </Button>
    </form>
    <Button>
      Passwort Ändern
    </Button>
  </div>
</template>
