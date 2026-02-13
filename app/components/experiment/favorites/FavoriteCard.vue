<script setup lang="ts">
import FavoriteButton from "~/components/experiment/favorites/FavoriteButton.vue"
import type { ExperimentList } from "~~/shared/types/Experiment.type"
import type { ExperimentAttributeDetail } from "~~/shared/types/ExperimentAttribute.type"

defineProps<{
  experiment: ExperimentList
  attributes: ExperimentAttributeDetail[] | null | undefined
}>()
</script>

<template>
  <NuxtLink
    :to="`/experiments/${experiment.slug}`"
    class="relative group border-0 cursor-move active:cursor-grabbing h-full block"
  >
    <Card class="flex flex-col h-full hover:shadow-lg transition-all duration-200 border-2 border-transparent group-hover:border-primary/20 bg-card text-card-foreground">
      <CardContent class="relative grow flex flex-col p-0 rounded-t-lg overflow-hidden">
        <div class="relative w-full min-h-[150px] flex flex-col items-center justify-center h-full">
          <NuxtPicture
            format="webp,avif"
            width="470"
            :src="experiment.previewImage?.path ?? 'experiment_placeholder.png'"
            alt="Preview Image"
            :img-attrs="{
              class: 'absolute inset-0 w-full h-full ' + (experiment.previewImage?.path ? 'object-contain' : 'object-cover'),
            }"
          />
          <div class="relative z-10 p-3 w-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity h-full flex items-center justify-center">
            <div class="grid grid-cols-2 gap-1 text-[10px]">
              <template
                v-for="attribute in attributes"
                :key="attribute.id"
              >
                <div class="text-right">{{ attribute.name }}:</div>
                <div class="flex flex-wrap gap-1">
                  <template
                    v-for="attributeValue in (experiment.attributes?.flatMap((a: any) => a.values) || [])"
                    :key="attributeValue.id"
                  >
                    <Badge
                      v-if="attribute.values.some(v => v.id === attributeValue.id)"
                      class="h-4 text-[8px] px-1 bg-primary text-primary-foreground border-0"
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
      <CardFooter class="flex flex-col items-start p-4 gap-2 w-full mt-auto">
        <CardTitle class="text-foreground/80 text-left flex justify-between w-full items-center">
          <span class="truncate mr-2 font-bold">{{ experiment.name }}</span>
          <FavoriteButton
            :experiment-id="experiment.id"
            :is-favorited-initial="true"
          />
        </CardTitle>
        <div class="flex gap-2">
          <Badge
            variant="outline"
            class="text-[10px]"
          >{{ experiment.duration }} Min.</Badge>
          <ExperimentRating
            :experiment="experiment"
            :small="true"
          />
        </div>
      </CardFooter>
    </Card>
  </NuxtLink>
</template>
