<script lang="ts" setup>
const { experiment, deleteExperiment, duplicateExperiment } = defineProps({
  experiment: {
    type: Object as PropType<Partial<Pick<ExperimentList, "revisedBy">> & Pick<ExperimentList, "id" | "name" | "status" | "slug">>,
    required: true,
  },
  revision: {
    type: Object as PropType<ExperimentList>,
    required: false,
  },
  deleteExperiment: {
    type: Function,
    required: true,
  },
  duplicateExperiment: {
    type: Function,
    required: true,
  },
})
</script>

<template>
  <NuxtLink
    :to="experiment.status === 'DRAFT' || experiment.status == 'REJECTED' ? `/experiments/edit/${experiment.id}` : `/experiments/${experiment.slug}`"
    class="no-underline"
  >
    <div class="flex items-center flex-col sm:flex-row justify-between">
      <div class="flex items-center space-x-2">
        <p class="font-medium">
          {{ nameOrPlaceholderForExperiment(experiment) }}
        </p>
        <Badge variant="secondary">
          {{ badgeTitleForExperimentStatus(experiment.status) }}
        </Badge>
      </div>
      <div class="flex flex-col sm:flex-row justify-center gap-2 pt-3 sm:pt-0">
        <!-- Creation of revision for already published experiments -->
        <Button
          v-if="experiment.status === 'PUBLISHED' && !experiment.revisedBy"
          variant="outline"
          @click="duplicateExperiment(experiment, true)"
          @click.prevent
        >
          Überarbeiten
        </Button>
        <Button
          v-if="experiment.status === 'DRAFT' || experiment.status == 'REJECTED'"
          variant="outline"
        >
          Bearbeiten
        </Button>
        <!-- Duplication for any non-published experiment -->
        <Button
          variant="outline"
          @click="duplicateExperiment(experiment, false)"
          @click.prevent
        >
          Duplizieren
        </Button>
        <ConfirmDeleteAlertDialog
          header="Löschen bestätigen"
          message="Diese Aktion kann nicht rückgängig gemacht werden. Das Experiment wird dauerhaft gelöscht."
          :on-delete="() => deleteExperiment(experiment.id)"
        >
          <Button
            variant="outline"
            class="hover:bg-destructive hover:text-destructive-foreground"
            @click.prevent
          >
            Löschen
          </Button>
        </ConfirmDeleteAlertDialog>
      </div>
    </div>
  </NuxtLink>
  <div
    v-if="experiment.revisedBy"
  >
    <Separator
      class="my-4"
      label="Überarbeitung"
    />
    <ExperimentRow
      :experiment="experiment.revisedBy"
      :delete-experiment="deleteExperiment"
      :duplicate-experiment="duplicateExperiment"
    />
  </div>
</template>
