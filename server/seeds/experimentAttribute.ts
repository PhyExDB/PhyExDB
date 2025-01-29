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
        multipleSelection: false,
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

    attributes.forEach(async (attribute, index) => {
      await prisma.experimentAttribute.create({
        data: {
          name: attribute.name,
          slug: slugify(attribute.name),
          multipleSelection: attribute.multipleSelection,
          order: index,
          values: {
            create: attribute.values.map(value => ({
              value: value,
              slug: slugify(value),
            })),
          },
        },
      })
    })
  }
}
