<script lang="ts" setup>
defineProps({
  url: String,
  appName: String,
})
</script>

<template>
  <!DOCTYPE html>
  <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      >
      <title>Verifiziere deine E-Mail</title>
    </head>
    <body>
      <div class="container">
        <h1>Willkommen bei {{ appName }}!</h1>
        <p>Um dein Konto zu aktivieren, bestätige bitte deine E-Mail-Adresse, indem du auf den Button unten klickst.</p>
        <a
          href="{{ url }}"
          class="button"
        >E-Mail bestätigen</a>
        <p class="footer">
          Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.
        </p>
      </div>
    </body>
  </html>
</template>
