<script setup lang="ts">
// const newUser = await authClient.admin.createUser({
//   name: "Test User",
//   email: "test@example.com",
//   password: "password123",
//   role: "USER",
// })
const users = await authClient.admin.listUsers({
  query: {
    limit: 10,
  },
})
</script>

<template>
  <div>
    Users:
    {{ users }}
  </div>
</template>
