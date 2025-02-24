<script lang="ts" setup></script>

<template>
  <div>
    <NuxtImg
      src="/experiment_placeholder.png"
      alt="Background Image"
      class="absolute top-[65px] left-0 w-full h-96 object-cover"
    />
    <div class="h-96" />
    <div class="py-8 text-center">
      <h3 class="mb-4 text-3xl font-semibold md:mb-5 md:text-4xl">
        PhyExDB
      </h3>
      <p class="text-lg text-muted-foreground md:text-xl">
        Datenbank für Versuche im Physikunterricht.
      </p>
      <div class="mt-8 flex w-full flex-col-reverse justify-center gap-3 md:w-auto md:flex-row">
        <NuxtLink to="/experiments">
          <Button
            size="lg"
            class="w-full md:w-48"
            variant="outline"
          >
            Versuche durchsuchen
          </Button>
        </NuxtLink>
        <NuxtLink to="/experiments/mine">
          <Button
            size="lg"
            class="w-full md:w-48"
          >
            Versuch erstellen
          </Button>
        </NuxtLink>
      </div>
    </div>
    <div class="py-8 text-center">
      <h4 class="mb-4 text-2xl font-semibold md:mb-5 md:text-3xl">
        Über diese Webseite
      </h4>
      <p class="text-lg md:text-xl">
        Dies ist eine Website über Experimente für den Physikunterricht. Es handelt sich um eine Bildungswebsite.
      </p>
    </div>
  </div>
</template>
