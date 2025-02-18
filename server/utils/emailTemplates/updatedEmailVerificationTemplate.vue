<script setup lang="ts">
import { Tailwind, Button, Head, Container, Text, Heading } from "@vue-email/components"

defineProps({
  url: String,
  username: String,
  newEmail: String,
})
</script>

<template>
  <Head>
    <title>Verifiziere deine neue E-Mail</title>
  </Head>
  <Tailwind
    :config="{
      theme: {
        extend: {
          colors: {
            accent: '#51a0fb',
            accentForeground: '#020817',
            muted: '#64748b',
            background: '#1e293b',
          },
        },
      },
    }"
  >
    <Container class="max-w-2xl mx-auto bg-background p-8 rounded-lg shadow-lg font-sans text-white pt-8 text-center">
      <Heading as="h1">
        Hallo {{ username }}!
      </Heading>
      <Text>
        Verifiziere deine neue E-Mail "{{ newEmail }}", indem du auf den Button unten klickst.
      </Text>
      <Button
        :href="url"
        class="bg-accent text-accent-foreground rounded-lg px-4 py-2 mt-4"
      >
        E-Mail bestätigen
      </Button>
    </Container>
  </Tailwind>
</template>
