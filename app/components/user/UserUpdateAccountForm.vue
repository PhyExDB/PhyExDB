<script lang="ts" setup>
const { user } = defineProps({
  user: {
    type: Object as PropType<UserDetail>,
    required: true,
  },
})
</script>

<template>
  <form>
    <FormField
      v-slot="{ componentField }"
      name="username"
    >
      <FormItem>
        <FormLabel>Nutzername</FormLabel>
        <FormControl>
          <Input
            id="username"
            :default-value="user.username"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="email"
    >
      <FormItem>
        <FormLabel>E-Mail</FormLabel>
        <FormControl>
          <Input
            id="email"
            :default-value="user.email"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </form>
</template>
