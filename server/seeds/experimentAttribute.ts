import prisma from "../lib/prisma"
import Seed from "./seed"
import slugify from "~~/server/utils/slugify"

/**
 * Experiment attribute seed.
 */
export default class ExperimentAttributeSeed extends Seed {
  constructor() {
    super("experimentAttribute")
  }

  /**
   * Seeds the database with experiment attributes.
   */
  async seed() {
    const attributes = [
      {
        name: "Themenbereich",
        multipleSelection: true,
        values: [
          "Optik",
          "Wärmelehre",
          "Magnetismus",
          "Elektrizität",
          "Mechanik",
          "Akustik",
          "Radioaktivität",
          "Atomphysik",
          "Quantenphysik",
        ],
      },
      {
        name: "Versuchsart",
        multipleSelection: false,
        values: ["Freihand", "Qualitativ", "Quantitativ", "Simulation"],
      },
      {
        name: "Einsatz",
        multipleSelection: true,
        values: ["Phänomene", "Gesetzmäßigkeiten", "Weiterführung"],
      },
      {
        name: "Arbeitsform",
        multipleSelection: true,
        values: ["Demoversuch", "SUS-Versuch", "Heimversuch"],
      },
      {
        name: "Messwert\u00ADerfassung",
        multipleSelection: true,
        values: ["Analog", "Digital", "Beobachtung"],
      },
      {
        name: "Vorbereitungs\u00ADzeit",
        multipleSelection: false,
        values: ["unter 1 Stunde", "ca. 1 Stunde", "mehrere Stunden", "mehrere Tage"],
      },
    ]

    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i]
      const attributeSlug = slugify(attribute.name)

      await prisma.experimentAttribute.upsert({
        where: { slug: attributeSlug },
        update: {
          name: attribute.name,
          multipleSelection: attribute.multipleSelection,
          order: i,
        },
        create: {
          name: attribute.name,
          slug: attributeSlug,
          multipleSelection: attribute.multipleSelection,
          order: i,
        },
      })

      const dbAttribute = await prisma.experimentAttribute.findUniqueOrThrow({
        where: { slug: attributeSlug },
      })

      for (let j = 0; j < attribute.values.length; j++) {
        const value = attribute.values[j]
        const valueSlug = slugify(value)

        await prisma.experimentAttributeValue.upsert({
          where: { slug: valueSlug },
          update: {
            value: value,
            order: j,
            attributeId: dbAttribute.id,
          },
          create: {
            value: value,
            slug: valueSlug,
            order: j,
            attributeId: dbAttribute.id,
          },
        })
      }
    }
  }
}
