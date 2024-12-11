<script lang="ts" setup>
import type { LegalDocumentDetail } from "~~/shared/types"

const { data: privacyPolicy } = await useAPI<LegalDocumentDetail>(
  "/api/legal/privacy-policy",
)
</script>

<template>
  <div class="prose dark:prose-invert">
    <h1>
      {{ privacyPolicy!.name }}
    </h1>
    <p>{{ privacyPolicy!.text }}</p>
  </div>
</template>
