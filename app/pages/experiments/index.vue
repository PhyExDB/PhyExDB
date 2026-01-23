<script setup lang="ts">
import Draggable from 'vuedraggable';
import FavoriteButton from '~/components/experiment/FavoriteButton.vue';

const route = useRoute();
const search = ref<string>((route.query.search as string) || '');
const sectionSearch = ref<string>((route.query.sections as string) || '');
const fetched = ref<boolean>(false);
const searchApiInput = ref<string>(search.value);
const sort = ref<string[]>([(route.query.sort as string) || 'none']);
const attributeFilter = ref<string>((route.query.attributes as string) || '');

const { page, pageSize } = getRequestPageMeta();

const isLoading = ref(false);
const { data } = useLazyFetch('/api/experiments', {
  query: {
    page: page,
    pageSize: pageSize,
    sort: sort,
    attributes: attributeFilter,
    search: searchApiInput,
    sections: sectionSearch,
  },
  onRequest: () => {
    fetched.value = false;
    setTimeout(() => {
      if (!fetched.value) {
        isLoading.value = true;
      }
    }, 100);
  },
  onResponse: () => {
    isLoading.value = false;
    fetched.value = true;
  },
});

watch([searchApiInput, sort, attributeFilter], () => {
  page.value = 1;
});

/* Search */
const { data: sections } = await useFetch(`/api/experiments/sections`);

const searchDialogOpen = ref(false);
const searchTitle = ref(false);
const temporarySearchTitle = ref(false);
const searchSections = ref<string[]>([]);
const temporarySearchSections = ref<string[]>([]);

function updateSectionSearch() {
  sectionSearch.value =
      (searchTitle.value ? 'titel' : '') +
      (searchSections.value.length > 0 && searchTitle.value ? ',' : '') +
      searchSections.value.join(',');
  if (sectionSearch.value.length === 0) {
    sectionSearch.value = 'keine';
  }
}
function initializeSearchSections() {
  if (sectionSearch.value.length > 0) {
    sectionSearch.value.split(',').forEach((sec) => {
      if (sec === 'titel') {
        searchTitle.value = true;
      } else {
        if (sections.value?.map((section) => section.slug).includes(sec)) {
          searchSections.value.push(sec);
        }
      }
    });
  } else {
    searchTitle.value = true;
    sections.value?.forEach((section) => searchSections.value.push(section.slug));
    updateSectionSearch();
  }
}
initializeSearchSections();

watch([searchTitle, searchSections], () => {
  updateSectionSearch();
});

let searchTimeout: NodeJS.Timeout;
watch(search, () => {
  isLoading.value = true;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchApiInput.value = search.value;
  }, 500);
});

function updateSectionSearchList(slug: string, add: boolean) {
  if (!temporarySearchSections.value.includes(slug) && add) {
    temporarySearchSections.value = temporarySearchSections.value.filter((_) => 1 === 1);
    temporarySearchSections.value.push(slug);
  } else if (!add) {
    temporarySearchSections.value = temporarySearchSections.value.filter((sectionSlug) => sectionSlug !== slug);
  }
}
function openSearchDialog() {
  searchDialogOpen.value = true;
  temporarySearchSections.value = searchSections.value;
  temporarySearchTitle.value = searchTitle.value;
}
function submitSearchOptions() {
  searchDialogOpen.value = false;
  searchSections.value = temporarySearchSections.value;
  searchTitle.value = temporarySearchTitle.value;
}

/* Attributes */
const { data: attributes } = await useFetch(`/api/experiments/attributes`);

function initializeFilterChecklist(list: string[][]) {
  if (!attributes) {
    return;
  }
  attributeFilter.value.split(',').forEach((slug) => {
    attributes.value?.forEach((attribute, attrIndex) => {
      list.push([]);
      attribute.values.forEach((value) => {
        if (value.slug === slug) {
          list[attrIndex]?.push(value.id);
        }
      });
    });
  });
}

const sortOptions = [
  { id: 'none', label: 'Keine Sortierung' },
  { id: 'alphabetical', label: 'Alphabetisch' },
  { id: 'duration', label: 'Durchführungsdauer' },
  { id: 'ratingsAvg', label: 'Bewertung' },
];

const checked = ref<string[][]>([]);
initializeFilterChecklist(checked.value);

/* Filter Dialog */
const filterDialogOpen = ref(false);
const temporaryChecked = ref<string[][]>([]);

function openFilterDialog() {
  temporaryChecked.value = checked.value;
  filterDialogOpen.value = true;
}
function submitFilters() {
  filterDialogOpen.value = false;
  checked.value = temporaryChecked.value;
}

/* React to Filter Changes */
function mapFilterIdToSlug(id: string) {
  for (const attribute of attributes.value || []) {
    for (const value of attribute.values) {
      if (id === value.id) {
        return value.slug;
      }
    }
  }
  return '';
}
watch(checked, () => {
  attributeFilter.value = checked.value
      .map((attribute) => attribute.map((attributeValue) => mapFilterIdToSlug(attributeValue)).join(','))
      .filter((attribute) => attribute.length > 0)
      .join(',');
});

const router = useRouter();
/* Update the URL */
watch([sort, attributeFilter, page, pageSize, search, searchTitle, sectionSearch], () => {
  const query: {
    attributes?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    search?: string;
    sections?: string;
  } = {};
  if (attributeFilter.value !== '') {
    query.attributes = attributeFilter.value;
  }
  if (page.value !== defaultPage) {
    query.page = page.value;
  }
  if (pageSize.value !== defaultPageSize) {
    query.pageSize = pageSize.value;
  }
  if (sort.value[0] !== 'none') {
    query.sort = sort.value[0];
  }
  if (search.value !== '') {
    query.search = search.value;
  }
  if (sectionSearch.value.split(',').length !== (sections.value?.length || 7) + 1) {
    if (sectionSearch.value.length === 0) {
      query.sections = 'keine';
    } else {
      query.sections = sectionSearch.value;
    }
  }
  const newUrl = { path: route.path, query };
  router.replace(newUrl);
});
/* Favorite Experiments Drag-and-Drop */
const favData = ref<any[]>([]);
watchEffect(() => {
  favData.value = (data.value?.items || [])
      .filter((exp: any) => exp.isFavorited)
      .sort((a: any, b: any) => a.favoriteNumberForSequence - b.favoriteNumberForSequence);
});
for (const exp of favData.value) {
  console.log('Fav Experiment:', exp.name, 'Experiment ID:', exp.id, 'Sequence Number:', exp.favoriteNumberForSequence);
}

async function onReorder(event: any) {
  if (favData.value.length === 0) {
    return;
  }
  await fetch(`/api/experiments/favorites/reorder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ experimentIds: favData.value.map((exp) => exp.id) }),
  });
}

onMounted(() => {
});
</script>

<template>
  <div class="grid grid-cols-1 gap-3">
    <div class="flex flex-col sm:flex-row gap-2 justify-between items-center">
      <!-- Search Bar -->
      <div class="w-full sm:max-w-sm items-center">
        <ExperimentSearch :search="search" @update:search="search = $event" />
      </div>
      <!-- Extended Search -->
      <Dialog :open="searchDialogOpen" @update:open="searchDialogOpen = $event">
        <DialogTrigger as-child>
          <Button variant="outline" class="w-full sm:w-auto" @click="openSearchDialog">
            Erweiterte Sucheinstellungen <Icon name="heroicons:adjustments-horizontal" class="ml-2 h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <div
              class="flex flex-col gap-4 justify-items-stretch items-center content-center justify-self-stretch w-full"
          >
            <DialogHeader>
              <DialogTitle>Erweiterte Sucheinstellungen</DialogTitle>
            </DialogHeader>
            <div class="flex flex-col items-start">
              <div class="flex items-center">
                <Checkbox
                    :value="'Titel'"
                    :checked="temporarySearchTitle"
                    @update:checked="(isChecked) => (temporarySearchTitle = isChecked)"
                />
                <label
                    for="title"
                    class="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    @click="temporarySearchTitle = !temporarySearchTitle"
                >
                  Titel
                </label>
              </div>
              <div v-for="section in sections" :key="section.id" class="flex items-center mt-2">
                <Checkbox
                    :value="section.name"
                    :checked="temporarySearchSections.includes(section.slug)"
                    @update:checked="(isChecked) => updateSectionSearchList(section.slug, isChecked)"
                />
                <label
                    class="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    @click="updateSectionSearchList(section.slug, !temporarySearchSections.includes(section.slug))"
                >
                  {{ section.name }}
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" @click="submitSearchOptions"> Änderungen speichern </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Filter -->
    <!-- Filter for Wide Screens -->
    <div class="flex-row gap-2 justify-between items-center hidden xl:flex">
      <ExperimentFilters
          :checked="checked"
          :attributes="attributes"
          :show-undo-button="true"
          :show-all-selected="false"
          @update:checked="checked = $event"
      />
    </div>
    <div class="flex flex-col sm:flex-row gap-1 justify-between items-center xl:hidden">
      <!-- Filter Dialog for Small Screens -->
      <Dialog :open="filterDialogOpen" @update:open="filterDialogOpen = $event">
        <DialogTrigger as-child>
          <Button variant="outline" class="w-full sm:w-auto" @click="openFilterDialog">
            Filter <Icon name="heroicons:adjustments-horizontal" class="ml-2 h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px] max-h-full overflow-auto">
          <div
              class="flex flex-col gap-4 justify-items-stretch items-center content-center justify-self-stretch w-full"
          >
            <DialogHeader>
              <DialogTitle>Filter Konfigurieren</DialogTitle>
            </DialogHeader>
            <ExperimentFilters
                :checked="checked"
                :attributes="attributes"
                :show-undo-button="false"
                :show-all-selected="true"
                @update:checked="temporaryChecked = $event"
            />
            <DialogFooter>
              <Button type="submit" @click="submitFilters"> Änderungen speichern </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <ExperimentUndoFilters
          :checked="checked"
          class="w-full sm:w-auto mt-2 sm:mt-0"
          @update:checked="checked = $event"
      />
    </div>

    <!-- Experiment Count & Sorting -->
    <div class="flex flex-col sm:flex-row gap-1 justify-between items-center">
      <div class="order-2 sm:order-1 pt-2 sm:pt-0 w-full sm:w-auto">
        {{ isLoading ? '...' : data?.items.length || 0 }} Experimente gefunden
      </div>
      <div class="w-full sm:w-64 order-1 sm:order-2">
        <MultiSelect
            :model-value="sort"
            :options="sortOptions"
            :value-for-option="(option) => option.label"
            search-placeholder="Sortierung"
            :allow-none="false"
            @update:model-value="sort = $event"
        >
          <template #empty> Sortierung </template>
          <template #preview="{ selected }">
            {{ sortOptions.find((option) => option.id === selected[0])?.label }}
          </template>
          <template #option="{ option }">
            {{ option.label }}
          </template>
        </MultiSelect>
      </div>
    </div>
    <!-- Experiments -->
    <div v-if="!isLoading">
      <div v-show="favData.length > 0">
        <div class="order-3 sm:order-2 pt-2 sm:pt-0 w-full sm:w-auto text-xl font-bold">Favoriten</div>
        <div class="text-sm text-gray-500 mb-2"> Ziehen um zu sortieren</div>
        <Draggable
            v-model="favData"
            item-key="id"
            tag="div"
            class="grid gap-4 min-h-96 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            @end="onReorder"
        >
          <template #item="{ element: experiment }">
            <NuxtLink :to="`/experiments/${experiment.slug}`" class="relative group border-0">
              <Card class="flex flex-col h-full">
                <CardContent class="relative grow flex flex-col p-0 rounded-t-lg overflow-hidden">
                  <!-- Image + Overlay Container (size determined by overlay) -->
                  <div class="relative w-full min-h-[150px] flex flex-col items-center justify-center h-full">
                    <!-- Image that adjusts to overlay size -->
                    <NuxtPicture
                        format="webp,avif"
                        width="470"
                        :src="experiment.previewImage?.path ?? 'experiment_placeholder.png'"
                        alt="Preview Image"
                        :img-attrs="{
                        class:
                          'absolute inset-0 w-full h-full ' +
                          (experiment.previewImage?.path ? 'object-contain' : 'object-cover'),
                      }"
                    />

                    <!-- Overlay Content (Defines Section Size) -->
                    <div
                        class="relative z-10 p-3 w-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity h-full flex items-center justify-center"
                    >
                      <div class="grid grid-cols-2 gap-1">
                        <template v-for="attribute in attributes" :key="attribute.id">
                          <div class="text-right">
                            {{ attribute.name }}
                          </div>
                          <div class="flex flex-wrap gap-1">
                            <template
                                v-for="attributeValue in experiment.attributes.map((attr: any) => attr.values).flat()"
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
                </CardContent>
                <Separator />
                <!-- Bottom Content -->
                <CardFooter class="flex flex-col items-start p-4 gap-2 w-full">
                  <CardTitle class="text-primary/80 text-left">
                    {{ experiment.name }}
                  </CardTitle>
                  <div class="flex flex-col sm:flex-row gap-2 w-full">
                    <Badge class="text-left">
                      <Icon name="heroicons:clock" class="mr-2 h-4 w-4" />
                      {{ experiment.duration }} Min.
                    </Badge>
                    <ExperimentRating :experiment="experiment" :small="true" />
                    <FavoriteButton
                        :experiment-id="experiment.id"
                        :is-favorited-initial="experiment.isFavorited ?? false"
                    />
                  </div>
                </CardFooter>
              </Card>
            </NuxtLink>
          </template>
        </Draggable>
      </div>
      <div class="order-3 sm:order-2 pt-2 sm:pt-0 w-full sm:w-auto text-xl font-bold mt-4">Alle Experimente</div>
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
                <NuxtPicture
                    format="webp,avif"
                    width="470"
                    :src="experiment.previewImage?.path ?? 'experiment_placeholder.png'"
                    alt="Preview Image"
                    :img-attrs="{
                    class:
                      'absolute inset-0 w-full h-full ' +
                      (experiment.previewImage?.path ? 'object-contain' : 'object-cover'),
                  }"
                />

                <!-- Overlay Content (Defines Section Size) -->
                <div
                    class="relative z-10 p-3 w-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity h-full flex items-center justify-center"
                >
                  <div class="grid grid-cols-2 gap-1">
                    <template v-for="attribute in attributes" :key="attribute.id">
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
            </CardContent>
            <Separator />
            <!-- Bottom Content -->
            <CardFooter class="flex flex-col items-start p-4 gap-2 w-full">
              <CardTitle class="text-primary/80 text-left">
                {{ experiment.name }}
              </CardTitle>
              <div class="flex flex-col sm:flex-row gap-2 w-full">
                <Badge class="text-left">
                  <Icon name="heroicons:clock" class="mr-2 h-4 w-4" />
                  {{ experiment.duration }} Min.
                </Badge>
                <ExperimentRating :experiment="experiment" :small="true" />
                <FavoriteButton
                    :experiment-id="experiment.id"
                    :is-favorited-initial="experiment.isFavorited ?? false"
                />
              </div>
            </CardFooter>
          </Card>
        </NuxtLink>
      </div>

      <MyPagination v-model="page" :page-meta="data?.pagination" />
    </div>
    <div v-if="isLoading">
      <div class="grid gap-4 min-h-96 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="index in 8" :key="index" class="flex flex-col space-y-3 items-center justify-center h-full w-full">
          <Skeleton class="h-full w-full min-h-[300px] rounded-xl" />
        </div>
      </div>
    </div>
  </div>
</template>
