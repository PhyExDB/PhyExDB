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

// const loading = ref(false)
// const knownMails: string[] = []

// const schema = z.object({
//   ...emailSchema,
//   ...usernameSchema,
// }).partial()

// const form = useForm({ validationSchema: toTypedSchema(schema) })

// const onSubmit = form.handleSubmit(async (values) => {
//   if (user.value) {
//     if (values.email && values.email !== user.value.email) {
//       console.log("email changed")
//       authClient.changeEmail({
//         newEmail: values.email,
//       })
//       const input = document.getElementById("email") as HTMLInputElement
//       input.value = ""
//     }
//     if (values.username && values.username !== user.value.username) {
//       console.log("username changed")
//       authClient.updateUser({
//         name: values.username,
//       })
//       const input = document.getElementById("username") as HTMLInputElement
//       input.value = ""
//     }
//   }
// })

// authClient.changePassword({
//     newPassword: "newPassword123",
//     currentPassword: "oldPassword123",
//     revokeOtherSessions: true, // revoke all other sessions the user is signed into
// });
</script>

<template>
  <div v-if="user">
    <Tabs
      default-value="account"
      class="w-[400px]"
    >
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="account">
          Account
        </TabsTrigger>
        <TabsTrigger value="password">
          Password
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Ändere hier deine Account-Informationen. Klicke auf "Speichern", wenn du fertig bist.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="space-y-1">
              <Label for="username">Benutzername</Label>
              <Input
                id="username"
                :default-value="user.username"
              />
            </div>
          </CardContent>
          <CardContent class="space-y-2">
            <div class="space-y-1">
              <Label for="email">E-Mail</Label>
              <Input
                id="email"
                :default-value="user.email"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Speichern</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Passwort</CardTitle>
            <CardDescription>
              Ändere hier dein Passwort. Klicke auf "Speichern", wenn du fertig bist.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="space-y-1">
              <Label for="current">Aktuelles Passwort</Label>
              <Input
                id="current"
                type="password"
              />
            </div>
            <div class="space-y-1">
              <Label for="new">Neues Passwort</Label>
              <Input
                id="new"
                type="password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Speichern</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
