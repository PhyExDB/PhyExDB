<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const colorMode = useColorMode()

const colorModes = [
  {
    name: "Hell",
    value: "light",
  },
  {
    name: "Dunkel",
    value: "dark",
  },
  {
    name: "System",
    value: "system",
  },
]
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
      >
        <Icon
          name="heroicons:moon"
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Icon
          name="heroicons:sun"
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <template
        v-for="mode in colorModes"
        :key="mode.value"
      >
        <DropdownMenuItem
          class="flex flex-row justify-between"
          @click="colorMode.preference = mode.value"
        >
          {{ mode.name }}
          <Icon
            v-if="colorMode.preference === mode.value"
            name="heroicons:check"
            class="ml-2 h-4 w-4"
          />
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
