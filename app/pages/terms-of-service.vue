<script lang="ts" setup>
import type { LegalDocumentDetail } from "~~/shared/types"

const { data: termsOfService } = await useAPI<LegalDocumentDetail>("/api/legal/terms-of-service")
</script>

<template>
  <div class="prose dark:prose-invert">
    <h1>
      {{ termsOfService!.name }}
    </h1>
    <p>{{ termsOfService!.text }}</p>
  </div>
</template>
