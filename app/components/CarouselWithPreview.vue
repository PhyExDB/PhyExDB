<script setup generic="T extends { id: string }" lang="ts">
import type { CarouselApi } from "@/components/ui/carousel"

const props = defineProps({
  items: {
    type: Array as () => T[],
    required: true,
  },
  showThumbnails: {
    type: Boolean,
    default: false,
  },
})

const emblaMainApi = ref<CarouselApi>()
const emblaThumbnailApi = ref<CarouselApi>()
const selectedIndex = ref(0)

function onSelect() {
  if (!emblaMainApi.value || (props.showThumbnails && !emblaThumbnailApi.value)) return
  selectedIndex.value = emblaMainApi.value.selectedScrollSnap()
  if (props.showThumbnails) emblaThumbnailApi.value?.scrollTo(selectedIndex.value)
}

function onThumbClick(index: number) {
  if (!emblaMainApi.value || !emblaThumbnailApi.value) return
  emblaMainApi.value.scrollTo(index)
}

watchOnce(emblaMainApi, (emblaMainApi) => {
  if (!emblaMainApi) return
  onSelect()
  emblaMainApi.on("select", onSelect)
  emblaMainApi.on("reInit", onSelect)
})
</script>

<template>
  <div class="w-full">
    <!-- Single Item Handling -->
    <div
      v-if="items.length === 1"
      class="max-h-96"
    >
      <slot
        name="item"
        :item="items[0]"
        :index="0"
      />
    </div>

    <!-- Carousel for Multiple Items -->
    <div v-else>
      <!-- Main Carousel -->
      <Carousel
        class="relative w-full max-h-96"
        @init-api="(val) => emblaMainApi = val"
      >
        <CarouselContent>
          <CarouselItem
            v-for="(item, index) in items"
            :key="item.id"
          >
            <slot
              name="item"
              :item="item"
              :index="index"
            />
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <!-- Thumbnails (optional) -->
      <Carousel
        v-if="showThumbnails"
        class="relative w-full mt-4 max-h-24"
        @init-api="(val) => emblaThumbnailApi = val"
      >
        <CarouselContent class="flex gap-1 m-2">
          <CarouselItem
            v-for="(item, index) in items"
            :key="item.id"
            class="pl-0 basis-1/6 cursor-pointer"
            @click="onThumbClick(index)"
          >
            <div
              class="p-1"
              :class="index === selectedIndex ? 'ring-2 ring-blue-500 rounded' : 'opacity-50'"
            >
              <slot
                name="thumbnail"
                :item="item"
                :index="index"
              />
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  </div>
</template>
