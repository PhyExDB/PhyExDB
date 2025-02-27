import { elasticsearchRecreateExperimentIndex } from "~~/server/utils/elasticsearch"

export default defineNitroPlugin(async () => {
  elasticsearchRecreateExperimentIndex()
})
