<script setup lang='ts'>
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

const { data: experiments } = await useAPI<Page<ExperimentList>>(`/api/experiments`)
console.log(experiments.value)
</script>

<template>
  <div>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 ">
      <Card
        v-for="experiment in experiments!.items"
        :key="experiment.id"
      >
        <CardHeader>
          <CardTitle>{{ experiment.name }}</CardTitle>
          <CardDescription>
            <Badge>{{ experiment.duration }} Minuten</Badge>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  </div>
</template>
