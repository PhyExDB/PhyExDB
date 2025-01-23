<script setup lang="ts">
// const newUser = await useAuth().client.admin.createUser({
//   name: "Test User",
//   email: "test@example.com",
//   password: "password123",
//   role: "USER",
// })
const users = await useAuth().client.admin.listUsers({
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
