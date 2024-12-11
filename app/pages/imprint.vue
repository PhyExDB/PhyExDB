<script lang="ts" setup>
import type { LegalDocumentDetail } from "~~/shared/types"

const { data: imprint } = await useAPI<LegalDocumentDetail>("/api/legal/imprint")
</script>

<template>
  <div class="prose dark:prose-invert">
    <h1>
      {{ imprint!.name }}
    </h1>
    <p>{{ imprint!.text }}</p>
  </div>
</template>
