<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { emailSchema } from "~~/shared/types/User.type"
import getInitials from "~~/shared/utils/initials"

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
    <Card class="max-w-sm w-full">
      <CardContent class="grid gap-4">
        <Avatar>
          <AvatarFallback>{{ getInitials(user.username) }}</AvatarFallback>
        </Avatar>
        <p
          order-1
          md:order-1
        >
          {{ user.username }}
        </p>
        <p
          order-2
          md:order-3
          color:muted
        >
          {{ user.email }}
        </p>
        <Dialog
          order-3
          md:order-2
        >
          <DialogTrigger as-child>
            <Button variant="outline">
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            fhgfhg
            <DialogFooter>
              <Button type="submit">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          order-4
          md:order-4
        >
          <DialogTrigger as-child>
            <Button variant="outline">
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            fhgfhg
            <DialogFooter>
              <Button type="submit">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <!-- emailVerified: {{ user.emailVerified }}
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
        </Button> -->
      </CardContent>
    </Card>
  </div>
</template>
