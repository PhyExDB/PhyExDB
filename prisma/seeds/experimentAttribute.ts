import { PrismaClient } from "@prisma/client"
import slugify from "~~/server/utils/slugify"

const prisma = new PrismaClient()

/**
 * Seeds the database with initial experiment attributes data.
 */
export async function experimentAttributeMigrations() {
  const attributes = [
    {
      name: "Themenbereich",
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
      values: ["Freihand", "Qualitativ", "Quantitativ", "Simulation"],
    },
    {
      name: "Einsatz",
      values: ["Phänomene", "Gesetzmäßigkeiten", "Weiterführung"],
    },
    {
      name: "Arbeitsform",
      values: ["Demoversuch", "SUS-Versuch", "Heimversuch"],
    },
    {
      name: "Messwerterfassung",
      values: ["Analog", "Digital", "Beobachtung"],
    },
    {
      name: "Vorbereitungszeit",
      values: ["unter 1 Stunde", "ca. 1 Stunde", "mehrere Stunden", "mehrere Tage"],
    },
  ]

  await prisma.experimentAttribute.createMany({
    data: attributes.map(attribute => ({
      name: attribute.name,
      slug: slugify(attribute.name),
      values: attribute.values.map(value => ({
        create: {
          value: value,
          slug: slugify(value),
        },
      })),
    })),
  })
}
