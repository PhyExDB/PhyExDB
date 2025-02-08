<script setup lang='ts'>
const route = useRoute()
const search = ref<string>(route.query.search as string || "")
const fetched = ref<boolean>(false)
const searchApiInput = ref<string>(search.value)
const sort = ref<string[]>([route.query.sort as string || "none"])
const attributeFilter = ref<string>(route.query.attributes as string || "")

const { page, pageSize } = getRequestPageMeta()

const isLoading = ref(false)
const { data } = useLazyFetch("/api/experiments", {
  query: {
    page: page,
    pageSize: pageSize,
    sort: sort,
    attributes: attributeFilter,
    search: searchApiInput,
  },
  onRequest: () => {
    fetched.value = false
    setTimeout(() => {
      if (!fetched.value) {
        isLoading.value = true
      }
    }, 100)
  },
  onResponse: () => {
    isLoading.value = false
    fetched.value = true
  },
})

// Search
let searchTimeout: NodeJS.Timeout
watch(search, () => {
  isLoading.value = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchApiInput.value = search.value
  }, 500)
})

/* Attributes */
const { data: attributes } = await useFetch(
  `/api/experiments/attributes`,
)

function initializeFilterChecklist(list: string[][]) {
  if (!attributes) {
    return
  }
  attributeFilter.value.split(",").forEach((slug) => {
    attributes.value?.forEach((attribute, attrIndex) => {
      list.push([])
      attribute.values.forEach((value) => {
        if (value.slug === slug) {
          list[attrIndex]?.push(value.id)
        }
      })
    })
  })
}

const sortOptions = [
  { id: "none", label: "Keine Sortierung" },
  { id: "alphabetical", label: "Alphabetisch" },
  { id: "duration", label: "Durchführungsdauer" },
]

const checked = ref<string[][]>([])
initializeFilterChecklist(checked.value)

/* Filter Dialog */
const dialogOpen = ref(false)
const temporaryChecked = ref<string[][]>([])

function openDialog() {
  temporaryChecked.value = checked.value
  dialogOpen.value = true
}
function submitFilters() {
  dialogOpen.value = false
  checked.value = temporaryChecked.value
}

/* React to Filter Changes */
function mapFilterIdToSlug(id: string) {
  for (const attribute of attributes.value || []) {
    for (const value of attribute.values) {
      if (id === value.id) {
        return value.slug
      }
    }
  }
  return ""
}
watch(checked, () => {
  attributeFilter.value = checked.value.map(
    attribute => attribute.map(
      attributeValue => mapFilterIdToSlug(attributeValue),
    ).join(","),
  ).filter(
    attribute => attribute.length > 0,
  ).join(",")
  console.log(attributeFilter)
})

/* Update the URL */
watch([sort, attributeFilter, page, pageSize, search], () => {
  const query:
  {
    attributes?: string
    page?: number
    pageSize?: number
    sort?: string
    search?: string
  } = {}
  if (attributeFilter.value !== "") {
    query.attributes = attributeFilter.value
  }
  if (page.value !== defaultPage) {
    query.page = page.value
  }
  if (pageSize.value !== defaultPageSize) {
    query.pageSize = pageSize.value
  }
  if (sort.value[0] !== "none") {
    query.sort = sort.value[0]
  }
  if (search.value !== "") {
    query.search = search.value
  }
  const newUrl = { path: route.path, query }
  useRouter().replace(newUrl)
})
</script>

<template>
  <div class="grid grid-cols-1 gap-3">
    <div class="w-full sm:max-w-sm items-center">
      <ExperimentsSearch
        :search="search"
        @update:search="search = $event"
      />
    </div>
    <!-- Filter -->
    <!-- Filter for Wide Screens -->
    <div class="flex-row gap-2 justify-between items-center hidden xl:flex">
      <ExperimentsFilters
        :checked="checked"
        :attributes="attributes"
        :show-undo-button="true"
        :show-all-selected="false"
        @update:checked="checked = $event"
      />
    </div>
    <div class="flex flex-col sm:flex-row gap-1 justify-between items-center xl:hidden">
      <!-- Filter Dialog for Small Screens -->
      <Dialog
        :open="dialogOpen"
        @update:open="dialogOpen = $event"
      >
        <DialogTrigger as-child>
          <Button
            variant="outline"
            class="w-full sm:w-auto"
            @click="openDialog"
          >
            Filter <Icon
              name="heroicons:adjustments-horizontal"
              class="ml-2 h-4 w-4"
            />
          </Button>
        </DialogTrigger>
        <DialogContent
          class="sm:max-w-[425px]"
        >
          <div
            class="flex flex-col gap-4 justify-items-stretch items-center content-center justify-self-stretch w-full"
          >
            <DialogHeader>
              <DialogTitle>Filter Konfigurieren</DialogTitle>
            </DialogHeader>
            <ExperimentsFilters
              :checked="checked"
              :attributes="attributes"
              :show-undo-button="false"
              :show-all-selected="true"
              @update:checked="temporaryChecked = $event"
            />
            <DialogFooter>
              <Button
                type="submit"
                @click="submitFilters"
              >
                Änderungen speichern
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <ExperimentsUndoFilters
        :checked="checked"
        class="w-full sm:w-auto mt-2 sm:mt-0"
        @update:checked="checked = $event"
      />
    </div>

    <!-- Experiment Count & Sorting -->
    <div class="flex flex-col sm:flex-row gap-1 justify-between items-center">
      <div class="order-2 sm:order-1 pt-2 sm:pt-0 w-full sm:w-auto">
        {{ isLoading ? "..." : data?.pagination.total }} Experimente gefunden
      </div>
      <div class="w-full sm:w-64 order-1 sm:order-2">
        <MultiSelect
          :model-value="sort"
          :options="sortOptions"
          :value-for-option="option => option.label"
          search-placeholder="Sortierung"
          :allow-none="false"
          @update:model-value="sort = $event"
        >
          <template #empty>
            Sortierung
          </template>
          <template #preview="{ selected }">
            {{ sortOptions.find(option => option.id === selected[0])?.label }}
          </template>
          <template #option="{ option }">
            {{ option.label }}
          </template>
        </MultiSelect>
      </div>
    </div>
    <!-- Experiments -->
    <div
      v-if="!isLoading"
    >
      <div class="grid gap-4 min-h-96 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <NuxtLink
          v-for="experiment in data?.items"
          :key="experiment.id"
          :to="`/experiments/${experiment.slug}`"
          class="relative group border-0"
        >
          <Card class="flex flex-col h-full">
            <CardContent class="relative grow flex flex-col p-0 rounded-t-lg overflow-hidden">
              <!-- Image + Overlay Container (size determined by overlay) -->
              <div class="relative w-full min-h-[150px] flex flex-col items-center justify-center h-full">
                <!-- Image that adjusts to overlay size -->
                <NuxtImg
                  :src="experiment.previewImage?.path ?? 'experiment_placeholder.png'"
                  alt="Preview Image"
                  class="absolute inset-0 w-full h-full"
                  :class="experiment.previewImage?.path ? 'object-contain' : 'object-cover'"
                />

                <!-- Overlay Content (Defines Section Size) -->
                <div
                  class="relative z-10 p-3 w-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity h-full flex items-center justify-center"
                >
                  <div class="grid grid-cols-2 gap-1">
                    <template
                      v-for="attribute in attributes"
                      :key="attribute.id"
                    >
                      <div class="text-right">
                        {{ attribute.name }}
                      </div>
                      <div class="flex flex-wrap gap-1">
                        <template
                          v-for="attributeValue in experiment.attributes.map((attr) => attr.values).flat()"
                          :key="attributeValue.id"
                        >
                          <Badge
                            v-if="attribute.values.map((value) => value.id).includes(attributeValue.id)"
                            class="h-5"
                          >
                            {{ attributeValue.value }}
                          </Badge>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <Separator />

              <!-- Bottom Content -->
              <div class="flex flex-col items-left p-4 gap-2 w-full">
                <CardTitle class="text-primary/80">
                  {{ experiment.name }}
                </CardTitle>
                <CardDescription>
                  <Badge>
                    <Icon
                      name="heroicons:clock"
                      class="mr-2 h-4 w-4"
                    />
                    {{ experiment.duration }} Min.
                  </Badge>
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        </NuxtLink>
      </div>

      <MyPagination
        v-model="page"
        :page-meta="data?.pagination"
      />
    </div>
    <div
      v-if="isLoading"
    >
      <div class="grid gap-4 min-h-96 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="index in 8"
          :key="index"
          class="flex flex-col space-y-3 items-center justify-center h-full w-full"
        >
          <Skeleton class="h-full w-full min-h-[300px] rounded-xl" />
        </div>
      </div>
    </div>
  </div>
</template>
