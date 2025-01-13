/**
 * Retrieves a list of experiments from the database that have slugs with the format `slug[number > 0]`.
 *
 * @param {string} slug - The slug to search for duplicates.
 * @returns {Promise<Experiment[]>} A promise that resolves to an array of experiments with slugs starting with the format "slug[number > 0]".
 */
async function getDuplicateSlugExperiments(slug: string) {
  const format = slug + "%"
  return prisma.experiment.findMany({
    where: {
      slug: {
        startsWith: format,
      },
    },
  })
}

/**
 * Generates a unique slug for an experiment by checking for potential duplicate slugs.
 * If a duplicate is found, a numerical suffix is appended to the slug.
 * If the name of the with `experimentId` associated experiment is equal to `experimentName`, the returned slug remains the same.
 *
 * @param experimentName - The experiment name which the slug should contain
 * @param experimentId - The ID of the experiment for which the slug is being generated.
 * @returns A promise that resolves to a unique slug string.
 */
export async function getUniqueSlugForExperiment(experimentName: string, experimentId: string) {
  let slug = slugify(experimentName)
  const potentialDuplicates = await getDuplicateSlugExperiments(slug)
  let duplicate = false
  let highestSuffix = "0"
  potentialDuplicates.forEach((potentialDuplicate) => {
    if (potentialDuplicate.id === experimentId) {
      // a working slug already exists
      return potentialDuplicate.slug
    } else {
      duplicate = true
      // a suffix exists
      if (potentialDuplicate.slug.length > slug.length) {
        const suffix = potentialDuplicate.slug.substring(slug.length)
        if (parseInt(suffix) > parseInt(highestSuffix)) {
          highestSuffix = suffix
        }
      }
    }
  })
  if (duplicate) {
    slug += (parseInt(highestSuffix) + 1)
  }
  return slug
}

/**
 * Generates a unique slug for an experiment by checking for potential duplicate slugs.
 * If a duplicate is found, a numerical suffix is appended to the slug.
 *
 * @param experimentName - The experiment name which the slug should contain
 * @returns A promise that resolves to a unique slug string.
 */
export async function getUniqueExperimentSlug(experimentName: string) {
  // the empty string cannot be an experimentId, thus there cannot exist an already working slug
  return getUniqueSlugForExperiment(experimentName, "")
}
