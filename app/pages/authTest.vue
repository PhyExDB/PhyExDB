<template>
  <div>
    <Can
      :ability="onlyAdminAbillity"
    >
      Admin
    </Can>
    <Can
      :ability="onlySignedInAbillity"
    >
      SignedIn
    </Can>
    <Bouncer
      :ability="allowedAbillity"
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
if (await allows(allowedAbillity)) {
  console.log("can")
}
if (await allows(forbiddenAbillity)) {
  console.log("cant")
}
</script>

<style>

</style>
