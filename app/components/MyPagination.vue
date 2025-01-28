<script setup lang="ts">
const { pageMeta } = defineProps<{ pageMeta?: PageMeta }>()
const model = defineModel<number>()

function update(newPage: number) {
  model.value = newPage
}
</script>

<template>
  <div
    v-if="pageMeta && pageMeta.total > pageMeta.pageSize"
    class="p-8"
  >
    <Pagination
      v-slot="{ page }"
      :items-per-page="pageMeta?.pageSize"
      :total="pageMeta?.total"
      :sibling-count="1"
      show-edges
      :default-page="pageMeta?.page"
      class="flex flex-row grow gap-4 justify-center items-center"
      @update:page="update"
    >
      <PaginationList
        v-slot="{ items }"
        class="flex items-center gap-1"
      >
        <PaginationFirst />
        <PaginationPrev />

        <template v-for="(item, index) in items">
          <PaginationListItem
            v-if="item.type === 'page'"
            :key="index"
            :value="item.value"
            as-child
          >
            <Button
              class="w-10 h-10 p-0"
              :variant="item.value === page ? 'default' : 'outline'"
            >
              {{ item.value }}
            </Button>
          </PaginationListItem>
          <PaginationEllipsis
            v-else
            :key="item.type"
            :index="index"
          />
        </template>

        <PaginationNext />
        <PaginationLast />
      </PaginationList>
    </Pagination>
  </div>
</template>
