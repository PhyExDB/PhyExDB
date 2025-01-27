<script setup lang='ts'>
import { NuxtLink } from "#components"

/* Pagination */
const route = useRoute()
const sort = ref(route.query.sort as string || "none")
const currentPage = ref(parseInt(route.query.page as string, 10) || 1)
const itemsPerPage = ref(parseInt(route.query.pageSize as string, 10) || 12)

/* Experiments */
const { data: experiments } = await useFetch(`/api/experiments?page=${currentPage.value}&pageSize=${itemsPerPage.value}`)
const fetchExperiments = async () => {
  const newExperiments = await $fetch(
    `/api/experiments?page=${currentPage.value}&pageSize=${itemsPerPage.value}`,
  )
  experiments.value = newExperiments
}
watch(currentPage, fetchExperiments)

/* Attributes */
const initializeFilterChecklist = (list: boolean[][]) => {
  attributes.value!.forEach((attribute) => {
    list.push(attribute.values.map(() => false))
  })
}
const { data: attributes } = await useFetch(
  `/api/experiments/attributes`,
)

const checked = ref<boolean[][]>([])
initializeFilterChecklist(checked.value)
const attributeOrder = [
  "Themenbereich",
  "Versuchsart",
  "Einsatz",
  "Arbeitsform",
  "Messwerterfassung",
  "Vorbereitungszeit",
]
attributes.value!.sort((a, b) => {
  const indexA = attributeOrder.indexOf(a.name)
  const indexB = attributeOrder.indexOf(b.name)
  return indexA - indexB
})
const singleChoiceAttributes = ["Themenbereich", "Versuchsart", "Vorbereitungszeit"]

/* Filter Dialog */
const dialogOpen = ref(false)

const temporaryChecked = ref<boolean[][]>([])
initializeFilterChecklist(temporaryChecked.value)

const submitFilters = () => {
  checked.value = temporaryChecked.value
  dialogOpen.value = false
}

watch(dialogOpen, () => {
  if (dialogOpen.value) {
    temporaryChecked.value = checked.value
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-3">
    <!-- Filter -->
    <!-- Filter for Wide Screens -->
    <div class="flex-row gap-1 justify-between items-center hidden xl:flex">
      <ExperimentsFilters
        :checked="checked"
        :attributes="attributes"
        :single-choice-attributes="singleChoiceAttributes"
        :show-undo-button="true"
      />
    </div>
    <div class="flex flex-row gap-1 justify-between items-center xl:hidden">
      <!-- Filter Dialog for Small Screens -->
      <Dialog
        :open="dialogOpen"
        @update:open="dialogOpen = $event"
      >
        <DialogTrigger as-child>
          <Button
            variant="outline"
            class="flex-grow-8"
            @click="dialogOpen = true"
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
              :checked="temporaryChecked"
              :attributes="attributes"
              :single-choice-attributes="singleChoiceAttributes"
              :show-undo-button="false"
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
      />
    </div>

    <!-- Experiment Count & Sorting -->
    <div class="flex flex-row gap-1 justify-between items-center">
      {{ experiments?.pagination?.total }} Experimente gefunden
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            Sortierung <Icon
              name="heroicons:chevron-up-down"
              class="ml-2 h-4 w-4"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup v-model="sort">
            <DropdownMenuRadioItem value="none">
              Keine Sortierung
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="duration">
              Durchführungsdauer
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="alphabetical">
              Alphabetisch
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <!-- Experiments -->
    <div class="grid gap-4 min-h-96 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <NuxtLink
        v-for="experiment in experiments?.items ?? []"
        :key="experiment.id"
        :to="`/experiments/${experiment.slug}`"
        class="relative group border-0"
      >
        <Card
          :style="{
            backgroundImage: experiment.previewImage == null ? 'url(experiment_placeholder.png)' : `url(${experiment.previewImage.path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }"
          class="flex flex-col h-full"
        >
          <CardContent
            class="grow flex flex-col justify-center items-center bg-black
          bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity p-0 rounded-t-lg"
          >
            <div
              v-for="attribute in attributes"
              :key="attribute.id"
              class="grid grid-cols-2 gap-4 w-full p-1"
            >
              <div class="text-right">
                {{ attribute.name }}
              </div>
              <div class="flex flex-row flex-wrap pd-1 text-left">
                <div
                  v-for="attributeValue in experiment.attributes"
                  :key="attributeValue.id"
                >
                  <Badge
                    v-if="attribute.values.map((value) => value.id).includes(attributeValue.id)"
                  >
                    {{ attributeValue.value }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>

          <CardHeader
            class="flex-none bottom-0 bg-black bg-opacity-75 text-white p-2 rounded-b-lg"
          >
            <CardTitle>{{ experiment.name }}</CardTitle>
            <CardDescription>
              <Badge>
                <Icon
                  name="heroicons:clock"
                  class="mr-2 h-4 w-4"
                />
                {{ experiment.duration }} Min.
              </Badge>
            </CardDescription>
          </CardHeader>
        </Card>
      </NuxtLink>
    </div>

    <!-- Pagination -->
    <div
      v-if="experiments?.pagination?.total > itemsPerPage"
    >
      <Pagination
        v-slot="{ page }"
        :items-per-page="itemsPerPage"
        :total="experiments?.pagination?.total"
        :sibling-count="1"
        show-edges
        :default-page="currentPage"
        class="flex flex-row grow gap-4 justify-center items-center"
        @update:page="currentPage = $event"
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
  </div>
</template>
