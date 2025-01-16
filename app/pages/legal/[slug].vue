<script lang="ts" setup>
import Button from "~/components/ui/button/Button.vue"
import type { LegalDocumentDetail } from "~~/shared/types"

definePageMeta({
  validate: ({ params }) => {
    return params.slug === "imprint" || params.slug === "privacy-policy" || params.slug === "terms-of-service"
  },
})

const route = useRoute()
const slug = route.params.slug as string

const { data: legal } = await useAPI<LegalDocumentDetail>(`/api/legal/${slug}`)
</script>

<template>
  <div class="prose dark:prose-invert">
    <h1>
      {{ legal!.name }}
    </h1>
    <p>{{ legal!.text }}</p>
    <Can
      :ability="onlyAdminAbillity"
    >
      <Button>
        <div>
          <NuxtLink
            to="EditLegal"
            class="text-black"
          >
            edit
          </NuxtLink>
        </div>
      </button>
    </Can>
  </div>
</template>
