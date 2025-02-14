<script lang="ts" setup>
const { ownExperiments, deleteExperiment } = defineProps({
  ownExperiments: {
    type: Object as PropType<Page<ExperimentList>>,
    required: true,
  },
  deleteExperiment: {
    type: Function as PropType<(id: string) => void>,
    required: true,
  },
  showShowAllExperimentsButton: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
})

const canCreateExperiment = await allows(experimentAbilities.post)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-center pt-4 text-muted-foreground">
      <p>
        {{ ownExperiments.pagination.total }} Versuche gefunden
      </p>
      <div class="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-0">
        <NuxtLink
          v-if="showShowAllExperimentsButton"
          to="/experiments/mine"
        >
          <Button
            variant="outline"
            class="w-full sm:w-auto"
          >
            Alle eigenen Versuche anzeigen
          </Button>
        </NuxtLink>

        <Button
          v-if="canCreateExperiment"
          @click="createExperiment"
        >
          Neuen Versuch erstellen
        </Button>
      </div>
    </div>
    <template
      v-for="experiment in ownExperiments.items"
      :key="experiment.id"
    >
      <Card
        v-if="!experiment.revisionOf"
        class="mt-4"
      >
        <CardContent class="p-4">
          <ExperimentRow
            :experiment="experiment"
            :delete-experiment="deleteExperiment"
            :duplicate-experiment="duplicateExperiment"
          />
        </CardContent>
      </Card>
    </template>
    <p
      v-if="!canCreateExperiment"
      class="mt-4 text-muted-foreground"
    >
      Bitte verifiziere deine E-Mail-Adresse, um einen Versuch zu erstellen.
    </p>
  </div>
</template>
