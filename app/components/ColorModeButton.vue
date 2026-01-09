<script setup lang="ts">
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
          class="absolute h-[1.2rem]! w-[1.2rem]! opacity-100 rotate-0 dark:opacity-0"
        />
        <Icon
          name="heroicons:sun"
          class="absolute h-[1.2rem]! w-[1.2rem]! transition-all
             opacity-0 scale-50
             dark:opacity-100 dark:rotate-0 dark:scale-100"
        />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end">
      <DropdownMenuItem
        v-for="mode in colorModes"
        :key="mode.value"
        class="flex flex-row justify-between cursor-pointer "
        @click="colorMode.preference = mode.value"
      >
        <span>{{ mode.name }}</span>
        <Icon
          v-if="colorMode.preference === mode.value"
          name="heroicons:check"
          class="ml-2 h-4! w-4!"
        />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
