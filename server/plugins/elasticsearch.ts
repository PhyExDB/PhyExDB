import { attributes } from 'happy-dom/lib/PropertySymbol.js';
import { elasticsearch } from '../lib/elasticsearch';

export default defineNitroPlugin(async () => {
    try{
        await elasticsearch.indices.delete({ index: 'experiments' });
    } catch(e){}
    await elasticsearch.indices.create({
        index: 'experiments',
        body: {
            settings: {
              analysis: {
                tokenizer: {
                  ngram_tokenizer: {
                    type: 'ngram',
                    min_gram: 2, // Minimum length of n-gram (e.g., "la")
                    max_gram: 3, // Maximum length of n-gram (e.g., "lap")
                  },
                },
                analyzer: {
                  ngram_analyzer: {
                    type: 'custom',
                    tokenizer: 'ngram_tokenizer', // Use the ngram tokenizer
                  },
                },
              },
            },
            mappings: {
              properties: {
                "name": { "type": "text", "analyzer": "ngram_analyzer" },
                "slug": { "type": "keyword" },
                "userId": { "type": "keyword" },
                "status": { "type": "keyword" },
                "duration": { "type": "integer" },
                "previewImageId": { "type": "keyword" },
                "ratingsCount": { "type": "integer" },
                "ratingsSum": { "type": "integer" },
                "ratingsAvg": { "type": "float" },
                "commentsEnabled": { "type": "boolean" },
                "revisionOfId": { "type": "keyword" },
                "changeRequest": { "type": "keyword" },
                "createdAt": { "type": "date" },
                "updatedAt": { "type": "date" },
                "previewImage": { "type": "keyword" },
                "attributes": {
                  "type": "nested",  // This makes attributes an array of nested objects
                  "properties": {
                    "id": { "type": "keyword" },
                    "slug": { "type": "keyword" },
                    "name": { "type": "text" },
                    "order": { "type": "integer" },
                    "multipleSelection": { "type": "boolean" },
                    "values": {
                      "type": "nested",  // Values inside attributes are also nested
                      "properties": {
                        "id": { "type": "keyword" },
                        "slug": { "type": "keyword" },
                        "value": { "type": "keyword" }
                      }
                    }
                  }
                },
                sections: {
                  type: 'nested',
                  properties: {
                    text: {
                      type: 'text',
                      analyzer: 'ngram_analyzer',
                    },
                    experimentSection: {
                      properties: {
                        name: {
                          type: 'keyword',
                        },
                      },
                    },
                  },
                }
              },
            },
        },
    });

    // Experiment Data
  const result = await prisma.experiment.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: experimentIncludeForToDetail,
  })

  const experiments = result.map(experiment => mapExperimentToDetail(experiment as ExperimentIncorrectDetail))

  elasticsearch.bulk({
    body: experiments.flatMap(experiment => [
      {
        index: {
          _index: "experiments",
          _id: experiment.id,
        },
      },
      experiment,
    ]),
  })

  elasticsearch.indices.refresh({ index: "experiments" })
})
