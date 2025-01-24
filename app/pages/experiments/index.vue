<script setup lang='ts'>
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import type { DropdownMenuCheckboxItemProps } from "radix-vue"
import { CaretSortIcon, ResetIcon, TimerIcon } from "@radix-icons/vue"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from "@/components/ui/pagination"

/* Pagination */
const route = useRoute()
const sort = ref(route.query.sort as string || "none")
const currentPage = ref(parseInt(route.query.page as string, 10) || 1)
const itemsPerPage = ref(parseInt(route.query.pageSize as string, 10) || 12)

/* Experiments */
const experiments = ref<globalThis.Page<globalThis.ExperimentList> | undefined>(undefined)
const fetchExperiments = async () => {
  const { data: newExperiments } = await useAPI<Page<ExperimentList>>(`/api/experiments?page=${currentPage.value}&pageSize=${itemsPerPage.value}`)
  experiments.value = newExperiments.value
}
fetchExperiments()
watch(currentPage, fetchExperiments)

/* Attributes */
const { data: attributes } = await useAPI<ExperimentAttributeDetail[]>(`/api/experiments/attributes`)
const checked = ref<boolean[][]>([])
attributes.value!.forEach((attribute) => {
  checked.value.push(attribute.values.map(() => false))
})
const attributeOrder = ["Themenbereich", "Versuchsart", "Einsatz", "Arbeitsform", "Messwerterfassung", "Vorbereitungszeit"]
attributes.value!.sort((a, b) => {
  const indexA = attributeOrder.indexOf(a.name)
  const indexB = attributeOrder.indexOf(b.name)
  return indexA - indexB
})
const singleChoiceAttributes = ["Themenbereich", "Versuchsart", "Vorbereitungszeit"]
const dialogOpen = ref(false)
</script>

<template>
  <div class="grid grid-cols-1 gap-3">
    <!-- Filter -->
    <div class="flex flex-row gap-1 justify-between items-center hidden lg:flex">
      <ExperimentsFilters
        :checked="checked"
        :attributes="attributes"
        :single-choice-attributes="singleChoiceAttributes"
        :show-undo-button="true"
      />
    </div>
    <div class="flex flex-row gap-1 justify-between items-center lg:hidden">
      <Dialog
        :open="dialogOpen"
      >
        <DialogTrigger as-child>
          <Button variant="outline">
            Filter
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Einstellungen</DialogTitle>
          </DialogHeader>
          <ExperimentsFilters
            :checked="checked"
            :attributes="attributes"
            :single-choice-attributes="singleChoiceAttributes"
            :show-undo-button="false"
          />
          <DialogFooter>
            <Button type="submit">
              Save changes
            </Button>
          </DialogFooter>
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
            Sortierung <CaretSortIcon class="ml-2 h-4 w-4" />
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
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 min-h-96">
      <Card
        v-for="experiment in experiments!.items"
        :key="experiment.id"
        :style="{ backgroundImage: experiment.previewImage == null ? 'url(experiment_placeholder.jpg)' : experiment.previewImage.path, backgroundSize: 'cover', backgroundPosition: 'center' }"
        class="relative group"
      >
        <div class="flex flex-col h-full">
          <CardContent class="grow flex flex-col justify-center items-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <div
              v-for="attribute in attributes"
              :key="attribute.id"
              class="grid grid-cols-2 gap-4 w-full p-1"
            >
              <div class="grid grid-cols-2 gap-2">
                {{ attribute.name }}
              </div>
              <div>
                <div
                  v-for="attributeValue in experiment.attributes"
                  :key="attributeValue.id"
                >
                  <Badge
                    v-if="attribute.values.map((value) => value.id).includes(attributeValue.id)"
                    class="bg-white text-black"
                  >
                    {{ attributeValue.value }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>

          <CardHeader class="flex-none bottom-0 bg-black bg-opacity-50 text-white p-2">
            <CardTitle>{{ experiment.name }}</CardTitle>
            <CardDescription>
              <Badge>
                <TimerIcon class="mr-2 h-4 w-4" />
                {{ experiment.duration }} Min.
              </Badge>
            </CardDescription>
          </CardHeader>
        </div>
      </Card>
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
