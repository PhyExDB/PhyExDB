import { elasticsearch } from '../lib/elasticSearch';

export default defineNitroPlugin(async () => {
    try{
        await elasticsearch.indices.delete({ index: 'experiments' });
    } catch(e){}
    await elasticsearch.indices.create({
        index: 'experiments', // The name of the index
        // body: {
        //     settings: {
        //     analysis: {
        //         tokenizer: {
        //         // Optional: You can customize the tokenizer here if needed
        //         },
        //         filter: {
        //         // German stop word filter
        //         german_stop: {
        //             type: 'stop',
        //             stopwords: '_german_', // Automatically uses a list of German stopwords
        //         },
        //         // German stemmer filter
        //         german_stemmer: {
        //             type: 'stemmer',
        //             language: 'german', // Automatically applies stemming rules for German
        //         },
        //         },
        //         analyzer: {
        //         // Define the custom analyzer
        //             german_analyzer: {
        //                 type: 'custom',
        //                 tokenizer: 'standard', //'standard' "edge_ngram_tokenizer" "compound_tokenizer",
        //                 filter: ['german_stop', 'german_stemmer'], // Apply stop word removal and stemming
        //             },
        //         },
        //     },
        //     },
        //     mappings: {
        //         properties: {
        //             text: {
        //             type: 'text',
        //             analyzer: 'german_analyzer', // Use the German analyzer for this field
        //             },
        //         },
        //     },
        // },
        body: {
            settings: {
              analysis: {
                tokenizer: {
                  ngram_tokenizer: {
                    type: 'ngram',
                    min_gram: 2, // Minimum length of n-gram (e.g., "la")
                    max_gram: 3, // Maximum length of n-gram (e.g., "laptop")
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
                name: {
                  type: 'text',
                  analyzer: 'ngram_analyzer', // Apply the custom ngram analyzer
                },
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
