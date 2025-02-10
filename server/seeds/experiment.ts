import { v4 as uuidv4 } from "uuid"
import prisma from "../lib/prisma"
import Seed from "./seed"

/**
 * Experiment seed.
 */
export default class ExperimentSeed extends Seed {
  constructor() {
    super("experiment")
  }

  /**
   * Seeds the database with initial experiment data.
   */
  async seed() {
    const versuchsziel = await prisma.experimentSection.findFirst({
      where: { name: "Versuchsziel" },
    })
    const material = await prisma.experimentSection.findFirst({
      where: { name: "Material" },
    })
    const versuchsaufbau = await prisma.experimentSection.findFirst({
      where: { name: "Versuchsaufbau" },
    })
    const durchfuehrung = await prisma.experimentSection.findFirst({
      where: { name: "Durchführung" },
    })
    const beobachtung = await prisma.experimentSection.findFirst({
      where: { name: "Beobachtung" },
    })
    const ergebnis = await prisma.experimentSection.findFirst({
      where: { name: "Ergebnis" },
    })
    const tippsUndTricks = await prisma.experimentSection.findFirst({
      where: { name: "Tipps und Tricks" },
    })

    await prisma.experiment.create({
      data: {
        id: uuidv4(),
        name: "Einführung des Fahrraddynamos",
        slug: "einfuehrung-des-fahrraddynamos",
        duration: 20,
        status: "PUBLISHED",
        user: {
          connect: {
            id: (await prisma.user.findFirst({ where: { email: "user@test.test" } }))!.id,
          },
        },
        sections: {
          createMany: {
            data: [
              {
                text: "Sensibilisierung für die Frage „Wie wird Strom erzeugt?“",
                experimentSectionId: versuchsziel!.id,
              },
              {
                text: "",
                experimentSectionId: material!.id,
              },
              {
                text: "",
                experimentSectionId: versuchsaufbau!.id,
              },
              {
                text: "Der Dynamo wird an den Reifen geklappt, sodass das Dynamorädchen am Fahrradreifen reiben kann. Das Hinterrad des Fahrrads wird angehoben und die Pedale werden mit der Hand gedreht.",
                experimentSectionId: durchfuehrung!.id,
              },
              {
                text: "Die Vorder- und die Hinterlampe des Fahrrads leuchten.",
                experimentSectionId: beobachtung!.id,
              },
              {
                text: "Es gibt ein physikalisches Phänomen, bei dem durch Bewegung ein Stromfluss erzeugt wird, das im Folgenden genauer untersucht werden soll. Dieses Phänomen nennt man Induktion.",
                experimentSectionId: ergebnis!.id,
              },
              {
                text: "",
                experimentSectionId: tippsUndTricks!.id,
              },
            ],
          },
        },
        attributes: {
          connect: [
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Magnetismus" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Elektrizität" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Freihand" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Phänomene" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Demoversuch" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Analog" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "unter 1 Stunde" } }))!.id,
            },
          ],
        },
      },
    })

    await prisma.experiment.create({
      data: {
        id: uuidv4(),
        name: "Öffnen des Fahrraddynamos",
        slug: "oeffnen-des-fahrraddynamos",
        duration: 20,
        status: "PUBLISHED",
        user: {
          connect: {
            id: (await prisma.user.findFirst({ where: { email: "user@test.test" } }))!.id,
          },
        },
        sections: {
          createMany: {
            data: [
              {
                text: "Was passiert im Inneren eines Fahrraddynamos?",
                experimentSectionId: versuchsziel!.id,
              },
              {
                text: "Man benötigt einen alten Fahrraddynamo, Werkzeug zum Öffnen des Gehäuses und ein kleines Stück Eisen.",
                experimentSectionId: material!.id,
              },
              {
                text: "Der Fahrraddynamo wird geöffnet, das Innere untersucht und ein Eisenstück an den Magneten gehalten.",
                experimentSectionId: versuchsaufbau!.id,
              },
              {
                text: "Der Dynamo wird mit Werkzeug geöffnet. Anschließend wird das Eisenstück an den Magneten im Dynamo gehalten.",
                experimentSectionId: durchfuehrung!.id,
              },
              {
                text: "Das Eisenstück wird vom Magneten im Dynamo angezogen.",
                experimentSectionId: beobachtung!.id,
              },
              {
                text: "Im Dynamo sind ein Magnet und eine Spule verbaut. Der Magnet erzeugt ein Magnetfeld, das zur Stromerzeugung beiträgt.",
                experimentSectionId: ergebnis!.id,
              },
              {
                text: "Achte darauf, dass das Werkzeug isoliert ist, um Verletzungen oder Beschädigungen zu vermeiden.",
                experimentSectionId: tippsUndTricks!.id,
              },
            ],
          },
        },
        attributes: {
          connect: [
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Magnetismus" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Elektrizität" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Freihand" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Phänomene" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Demoversuch" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Analog" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "unter 1 Stunde" } }))!.id,
            },
          ],
        },
      },
    })

    await prisma.experiment.create({
      data: {
        id: uuidv4(),
        name: "Doppelspaltversuch",
        slug: "doppelspaltversuch",
        duration: 10,
        status: "PUBLISHED",
        user: {
          connect: {
            id: (await prisma.user.findFirst({ where: { email: "user@test.test" } }))!.id,
          },
        },
        sections: {
          createMany: {
            data: [
              {
                text: "Was passiert im Inneren eines Fahrraddynamos?",
                experimentSectionId: versuchsziel!.id,
              },
              {
                text: "Man benötigt einen alten Fahrraddynamo, Werkzeug zum Öffnen des Gehäuses und ein kleines Stück Eisen.",
                experimentSectionId: material!.id,
              },
              {
                text: "Der Fahrraddynamo wird geöffnet, das Innere untersucht und ein Eisenstück an den Magneten gehalten.",
                experimentSectionId: versuchsaufbau!.id,
              },
              {
                text: "Der Dynamo wird mit Werkzeug geöffnet. Anschließend wird das Eisenstück an den Magneten im Dynamo gehalten.",
                experimentSectionId: durchfuehrung!.id,
              },
              {
                text: "Das Eisenstück wird vom Magneten im Dynamo angezogen.",
                experimentSectionId: beobachtung!.id,
              },
              {
                text: "Im Dynamo sind ein Magnet und eine Spule verbaut. Der Magnet erzeugt ein Magnetfeld, das zur Stromerzeugung beiträgt.",
                experimentSectionId: ergebnis!.id,
              },
              {
                text: "Achte darauf, dass das Werkzeug isoliert ist, um Verletzungen oder Beschädigungen zu vermeiden.",
                experimentSectionId: tippsUndTricks!.id,
              },
            ],
          },
        },
        attributes: {
          connect: [
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Quantenphysik" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Freihand" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Weiterführung" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Demoversuch" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Analog" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Digital" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "unter 1 Stunde" } }))!.id,
            },
          ],
        },
      },
    })

    await prisma.experiment.create({
      data: {
        id: uuidv4(),
        name: "Millikan-Versuch",
        slug: "millikan-versuch",
        duration: 15,
        status: "PUBLISHED",
        user: {
          connect: {
            id: (await prisma.user.findFirst({ where: { email: "user@test.test" } }))!.id,
          },
        },
        sections: {
          createMany: {
            data: [
              {
                text: "Was passiert im Inneren eines Fahrraddynamos?",
                experimentSectionId: versuchsziel!.id,
              },
              {
                text: "Man benötigt einen alten Fahrraddynamo, Werkzeug zum Öffnen des Gehäuses und ein kleines Stück Eisen.",
                experimentSectionId: material!.id,
              },
              {
                text: "Der Fahrraddynamo wird geöffnet, das Innere untersucht und ein Eisenstück an den Magneten gehalten.",
                experimentSectionId: versuchsaufbau!.id,
              },
              {
                text: "Der Dynamo wird mit Werkzeug geöffnet. Anschließend wird das Eisenstück an den Magneten im Dynamo gehalten.",
                experimentSectionId: durchfuehrung!.id,
              },
              {
                text: "Das Eisenstück wird vom Magneten im Dynamo angezogen.",
                experimentSectionId: beobachtung!.id,
              },
              {
                text: "Im Dynamo sind ein Magnet und eine Spule verbaut. Der Magnet erzeugt ein Magnetfeld, das zur Stromerzeugung beiträgt.",
                experimentSectionId: ergebnis!.id,
              },
              {
                text: "Achte darauf, dass das Werkzeug isoliert ist, um Verletzungen oder Beschädigungen zu vermeiden.",
                experimentSectionId: tippsUndTricks!.id,
              },
            ],
          },
        },
        attributes: {
          connect: [
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Atomphysik" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Quantenphysik" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Simulation" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Gesetzmäßigkeiten" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "SUS-Versuch" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Beobachtung" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "unter 1 Stunde" } }))!.id,
            },
          ],
        },
      },
    })

    await prisma.experiment.create({
      data: {
        id: uuidv4(),
        name: "Weinglasschwingung",
        slug: "weinglasschwingung",
        duration: 20,
        status: "PUBLISHED",
        user: {
          connect: {
            id: (await prisma.user.findFirst({ where: { email: "user@test.test" } }))!.id,
          },
        },
        sections: {
          createMany: {
            data: [
              {
                text: "Mit Hilfe dieses Experiment soll ein Weinglas hinsichtlich seiner Schwingungseigenschaften genauer untersucht werden und eine freie Schwingung mit einer erzwungenen Schwingung verglichen werden.",
                experimentSectionId: versuchsziel!.id,
              },
              {
                text: "Weinglas, Handy mit Applet zur Bestimmung der frequenzabhängigen Intensität, Wasser, Becherglas, Stimmgabel",
                experimentSectionId: material!.id,
              },
              {
                text: "GIBT NUR BILD",
                experimentSectionId: versuchsaufbau!.id,
              },
              {
                text: "Der Bildschirm des Handy’s wird mit Hilfe eines Beamers für alle SuS sichtbar an eine Wand projiziert. Das ungefüllte Weinglas wird angeschlagen und das Frequenzspektrum wird mit Hilfe des Handys aufgenommen. Dieses Experiment wird mit dem gefüllten Weinglas wiederholt. Mit Hilfe der Cursor des Applets können die Amplitudenmaxima den passenden Frequenzen zugeordnet werden.",
                experimentSectionId: durchfuehrung!.id,
              },
              {
                text: "Auf dem Handy wird ein Amplituden-Frequenz-Diagramm dargestellt, wie es der nebenstehenden Abb. II.2 entnommen werden kann. Mit Hilfe des grünen Cursors könnte man als Frequenz, bei der die Amplitude maximal wird, etwa 800 Hz ablesen. Für die Maxima der Weinglasschwingungen haben sich die folgenden Frequenzen ergeben: TABELLE IN MARKDOWN",
                experimentSectionId: beobachtung!.id,
              },
              {
                text: "Bei einer erzwungenen Schwingung hängt die Frequenz des Oszillators nicht von der Eigenfrequenz, sondern nur von der Erregerfrequenz zusammen.",
                experimentSectionId: ergebnis!.id,
              },
              {
                text: "Damit das Geschehen von allen gut einsehbar ist, sollte man den Handybildschirm mit Hilfe eines Beamers auf eine weiße Wand projizieren. Tatsächlich können mit der App keine belastbaren Messergebnisse erfasst werden. Mit Hilfe der 3 Cursor kann dennoch demonstriert werden, dass das Berühren des Weinglases mit der Stimmgabel für das volle und das leere Weinglas ein Amplitudenmaximum bei derselben Frequenz erzeugt.",
                experimentSectionId: tippsUndTricks!.id,
              },
            ],
          },
        },
        attributes: {
          connect: [
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Akustik" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Mechanik" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Quantitativ" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Gesetzmäßigkeiten" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "SUS-Versuch" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Digital" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "ca. 1 Stunde" } }))!.id,
            },
          ],
        },
      },
    })

    await prisma.experiment.create({
      data: {
        id: uuidv4(),
        name: "Versuch von Boyle-Mariotte",
        slug: "versuch-von-boyle-mariotte",
        duration: 20,
        user: {
          connect: {
            id: (await prisma.user.findFirst({ where: { email: "user@test.test" } }))!.id,
          },
        },
        sections: {
          createMany: {
            data: [
              {
                text: "Es soll der Zusammenhang von Druck und Volumen eines Gases untersucht werden.",
                experimentSectionId: versuchsziel!.id,
              },
              {
                text: "Boyle-Mariotte- Apparat.",
                experimentSectionId: material!.id,
              },
              {
                text: "Ein Kolben ist mit einem Glasrohr verbunden, welches durch eine Metallkugel in zwei Bereiche geteilt ist. Die Position der Kugel kann durch eine Längenskala, der im System herrschende Druck durch ein Barometer abgelesen werden.",
                experimentSectionId: versuchsaufbau!.id,
              },
              {
                text: "Mit dem Kolben wird die Luft in dem Glasrohr komprimiert oder expandiert. Dabei wird die Auslenkung der Kugel sowie der Druck am Barometer abgelesen. Anschließend wird der Druck gegen die Auslenkung (sowie die inverse Auslenkung)1 aufgetragen.",
                experimentSectionId: durchfuehrung!.id,
              },
              {
                text: "(1) Bei Druck auf den Kolben verschiebt sich die Kugel auf die rechte Seite und der Druck steigt. (2) Bei Zug am Kolben, verschiebt sich die Kugel nach links und der Druck sinkt.",
                experimentSectionId: beobachtung!.id,
              },
              {
                text: "Wird der Kolben verschoben, so ändert sich der Druck der Luft in der linken Seite des Glasrohrs. Somit ist der Druck verschieden vom rechten Teil des Rohrs, was dazu führt, dass die Kugel sich verschiebt, bis die Drücke sich ausgleichen.",
                experimentSectionId: ergebnis!.id,
              },
              {
                text: "Keine Ahnung",
                experimentSectionId: tippsUndTricks!.id,
              },
            ],
          },
        },
        attributes: {
          connect: [
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Radioaktivität" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Quantenphysik" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Qualitativ" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Simulation" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Heimversuch" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "Beobachtung" } }))!.id,
            },
            {
              id: (await prisma.experimentAttributeValue.findFirst({ where: { value: "mehrere Tage" } }))!.id,
            },
          ],
        },
      },
    })
  }
}
