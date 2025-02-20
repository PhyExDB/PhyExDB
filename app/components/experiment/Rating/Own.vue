<script lang="ts" setup>
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"

const props = defineProps<{ 
  experiment: Pick<ExperimentList, "id">,
}>()
const id = computed(() => props.experiment.id)

const canRate = await allows(experimentAbilities.rate)

const { data: ownRating, refresh } = await useFetch<ExperimentRating>(`/api/experiments/ratings/${id.value}`)

async function deleteRating(){
  await $fetch(`/api/experiments/ratings/${id.value}`, {
    method: "DELETE",
  })
  ownRating.value = undefined
}

const loading = ref(false)
const formSchema = toTypedSchema(experimentRatingSchema)
const form = useForm({ validationSchema: formSchema })
const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true

  await $fetch(`/api/experiments/ratings/${id.value}`, {
    method: "POST",
    body: values,
  })
  ownRating.value = values
  
  loading.value = false
})

</script>

<template>
  <div v-if="canRate">
    <div v-if="ownRating">
      Eigene Bewertung:
      <ExperimentRatingStars      
        :stars="ownRating.value"
      />
      <Button
        variant="outline"
        @click="deleteRating"
      >
        Bewertung löschen
      </Button>
    </div>

    <div v-else>
      <form
        class="grid gap-4"
        @submit="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="value"
        >
          <FormItem>
            <FormLabel>Rating</FormLabel>
            <FormControl>
              <Input
                id="value"
                v-bind="componentField"
                type="number"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button
          :loading="loading"
          type="submit"
        >
          Bewertung abgeben
        </Button>
      </form>
    </div>
  </div>
</template>