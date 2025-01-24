<script setup lang="ts">
const list1 = ["tape1", "tape2", "tape3"]
const list2 = ["tape4", "tape5", "tape6"]
const lists = [list1, list2]

// // Ensure `dragAndDrops` is reactive
// const dragAndDrops = reactive(
//   lists.value.map((list) => {
//     const [parent, tapes] = useDragAndDrop(list.value, { group: "list" })
//     return { parent, tapes }
//   }),
// )
</script>

<template>
  <div>
    <template
      v-for="(list, index) in lists"
      :key="index"
    >
      <h1>List {{ index + 1 }}</h1>
      <DraggableList
        :values="list"
      >
        <template #item="{ item }">
          <div>{{ item }}</div>
        </template>
      </DraggableList>
    </template>
  </div>
</template>
