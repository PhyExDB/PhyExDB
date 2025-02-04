<script setup lang="ts">
const user = defineProps<{
  email: string
  emailVerified: boolean
}>()
</script>

<template>
  <div class="flex flex-nowrap">
    <p>{{ email }}</p>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Icon
            v-if="user.emailVerified"
            size="1.2em"
            class="text-success-foreground"
            name="heroicons:check-badge"
          />
          <Icon
            v-else
            size="1.2em"
            class="text-destructive m-0.5"
            name="heroicons:exclamation-circle"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>E-Mail ist {{ user.emailVerified ? "verifiziert" : "nicht verifiziert" }}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>
