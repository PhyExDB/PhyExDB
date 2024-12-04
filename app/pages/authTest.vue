<template>
  <div>
    <Can
      :ability="testAbillity"
    >
      <button>Edit</button>
    </Can>
    <Bouncer
      :ability="testAbillity"
    >
      <template #can>
        can
      </template>

      <template #cannot>
        <p>You're not allowed to edit the post.</p>
      </template>
    </Bouncer>
  </div>
</template>

<script lang="ts" setup>
if (await allows(testAbillity)) {
  console.log("can")
}
if (await allows(forbiddenAbillity)) {
  console.log("cant")
}
</script>

<style>

</style>
