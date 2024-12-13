<script lang="ts" setup>
// const { data: hello } = await useAPI<string>("/hello")

const {
  status,
  data,
  lastRefreshedAt,
  token,
  refreshToken,
  getSession,
} = useAuth()

getSession()
</script>

<template>
  <div>
    <h1>Hello World</h1>
    <p>status; {{ status }}</p>
    <p>lastRefreshed: {{ lastRefreshedAt }}</p>
    <p>data: {{ data }}</p>
    <p>token: {{ token }}</p>
    <p>refreshToken: {{ refreshToken }}</p>
  </div>
</template>
