import type { SitemapUrlInput } from "#sitemap/types"

export default defineSitemapEventHandler(async () => {
  const urls = await prisma.experiment.findMany({
    where: {
      status: "PUBLISHED",
    },
    select: {
      slug: true,
      previewImage: true,
      updatedAt: true,
      sections: {
        select: {
          files: {
            select: {
              description: true,
              file: {
                select: {
                  mimeType: true,
                  path: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return urls.map((url) => {
    const previewImage = url.previewImage
      ? {
          loc: url.previewImage.path,
          title: "Preview Image",
          caption: "Preview Image",
        }
      : undefined

    const sectionImages = url.sections.flatMap((section) => {
      return section.files.flatMap((file) => {
        if (file.file.mimeType?.startsWith("image/")) {
          return {
            loc: file.file.path,
            title: file.description ?? "Image",
            caption: file.description ?? "Image",
          }
        }
      })
    })

    const images = [
      previewImage,
      ...sectionImages,
    ].filter(image => image != undefined)

    return {
      loc: `/experiments/${url.slug}`,
      lastmod: url.updatedAt.toISOString(),
      images: images,
    }
  }) satisfies SitemapUrlInput[]
})
