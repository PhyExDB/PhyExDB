import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

// password: password
const passwordHash = "7909e84c2f533030cd283e700834f355:9308a253a95c78259448d990960c41738fb5c89519febce3863347be087ce636bcf0815ae312b65b66c5f3f4a3605d1418cdecbef6f982e3f65e317220789220"

const prisma = new PrismaClient()

async function createUser(user: UserDetail) {
  await prisma.account.create({
    data: {
      password: passwordHash,
      providerId: "credential",
      accountId: uuidv4(),
      id: uuidv4(),
      user: {
        create: {
          id: user.id,
          role: user.role,
          name: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

async function userMigrations() {
  const users: UserDetail[] = [
    {
      id: uuidv4(),
      username: "User",
      role: "USER",
      email: "user@test.test",
      emailVerified: true,
    },
    {
      id: uuidv4(),
      username: "Moderator",
      role: "MODERATOR",
      email: "moderator@test.test",
      emailVerified: true,
    },
    {
      id: uuidv4(),
      username: "Admin",
      role: "ADMIN",
      email: "admin@test.test",
      emailVerified: true,
    },
    {
      id: uuidv4(),
      username: "Unverified",
      role: "USER",
      email: "unverified@test.test",
      emailVerified: false,
    },
  ]
  users.forEach(async user => createUser(user))
}

async function legalMigrations() {
  await prisma.legalDocument.createMany({
    data: [
      {
        name: "Privacy Policy",
        slug: "privacy-policy",
        text: "This is the privacy policy.",
      },
      {
        name: "Terms of Service",
        slug: "terms-of-service",
        text: "These are the terms of service.",
      },
      {
        name: "Imprint",
        slug: "imprint",
        text: "This is the imprint.",
      },
    ],
  })
}

async function experimentMigrations() {
  const versuchsziel = await prisma.experimentSection.findFirst({
    where: { name: "Versuchsziel" },
  })
  const material = await prisma.experimentSection.findFirst({
    where: { name: "Material" },
  })
  const versuchsaufbau = await prisma.experimentSection.findFirst({
    where: { name: "Versuchsaufbau" },
  })
  const durchführung = await prisma.experimentSection.findFirst({
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
              experimentSectionId: durchführung!.id,
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
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Magnetismus" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Elektrizität" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Freihand" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Phänomene" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Demoversuch" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Analog" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "unter 1 Stunde" } }))!.id,
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
              experimentSectionId: durchführung!.id,
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
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Magnetismus" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Elektrizität" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Freihand" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Phänomene" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Demoversuch" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Analog" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "unter 1 Stunde" } }))!.id,
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
              experimentSectionId: durchführung!.id,
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
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Akustik" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Mechanik" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Quantitativ" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Gesetzmäßigkeiten" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "SUS-Versuch" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Digital" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "ca. 1 Stunde" } }))!.id,
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
              experimentSectionId: durchführung!.id,
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
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Radioaktivität" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Quantenphysik" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Qualitativ" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Simulation" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Heimversuch" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "Beobachtung" } }))!.id,
          },
          {
            id: (await prisma.experimentAttributeValue.findFirst({ where: { name: "mehrere Tage" } }))!.id,
          },
        ],
      },
    },
  })
}

async function experimentSectionMigrations() {
  await prisma.experimentSection.createMany({
    data: [
      { name: "Versuchsziel", order: 0 },
      { name: "Material", order: 1 },
      { name: "Versuchsaufbau", order: 2 },
      { name: "Durchführung", order: 3 },
      { name: "Beobachtung", order: 4 },
      { name: "Ergebnis", order: 5 },
      { name: "Tipps und Tricks", order: 6 },
    ],
  })
}

async function experimentAttributeMigrations() {
  await prisma.experimentAttribute.createMany({
    data: [
      { name: "Themenbereich", slug: "themenbereich" },
      { name: "Versuchsart", slug: "versuchsart" },
      { name: "Einsatz", slug: "einsatz" },
      { name: "Arbeitsform", slug: "arbeitsform" },
      { name: "Messwerterfassung", slug: "messwerterfassung" },
      { name: "Vorbereitunsgzeit", slug: "vorbereitungszeit" },
      { name: "Durchführungszeit", slug: "durchfuehrungszeit" },
    ],
  })
}

async function experimentAttributeValueMigrations() {
  const themenbereich = await prisma.experimentAttribute.findUnique({
    where: { slug: "themenbereich" },
  })
  const versuchsart = await prisma.experimentAttribute.findUnique({
    where: { slug: "versuchsart" },
  })
  const einsatz = await prisma.experimentAttribute.findUnique({
    where: { slug: "einsatz" },
  })
  const arbeitsform = await prisma.experimentAttribute.findUnique({
    where: { slug: "arbeitsform" },
  })
  const messwerterfassung = await prisma.experimentAttribute.findUnique({
    where: { slug: "messwerterfassung" },
  })
  const vorbereitungszeit = await prisma.experimentAttribute.findUnique({
    where: { slug: "vorbereitungszeit" },
  })

  await prisma.experimentAttributeValue.createMany({
    data: [
      // Themenbereich
      { attributeId: themenbereich!.id, name: "Optik" },
      { attributeId: themenbereich!.id, name: "Wärmelehre" },
      { attributeId: themenbereich!.id, name: "Magnetismus" },
      { attributeId: themenbereich!.id, name: "Elektrizität" },
      { attributeId: themenbereich!.id, name: "Mechanik" },
      { attributeId: themenbereich!.id, name: "Akustik" },
      { attributeId: themenbereich!.id, name: "Radioaktivität" },
      { attributeId: themenbereich!.id, name: "Atomphysik" },
      { attributeId: themenbereich!.id, name: "Quantenphysik" },
      // Versuchsart
      { attributeId: versuchsart!.id, name: "Freihand" },
      { attributeId: versuchsart!.id, name: "Qualitativ" },
      { attributeId: versuchsart!.id, name: "Quantitativ" },
      { attributeId: versuchsart!.id, name: "Simulation" },
      // Einsatz
      { attributeId: einsatz!.id, name: "Phänomene" },
      { attributeId: einsatz!.id, name: "Gesetzmäßigkeiten" },
      { attributeId: einsatz!.id, name: "Weiterführung" },
      // Arbeitsform
      { attributeId: arbeitsform!.id, name: "Demoversuch" },
      { attributeId: arbeitsform!.id, name: "SUS-Versuch" },
      { attributeId: arbeitsform!.id, name: "Heimversuch" },
      // Messwerterfassung
      { attributeId: messwerterfassung!.id, name: "Analog" },
      { attributeId: messwerterfassung!.id, name: "Digital" },
      { attributeId: messwerterfassung!.id, name: "Beobachtung" },
      // Vorbereitungszeit
      { attributeId: vorbereitungszeit!.id, name: "unter 1 Stunde" },
      { attributeId: vorbereitungszeit!.id, name: "ca. 1 Stunde" },
      { attributeId: vorbereitungszeit!.id, name: "mehrere Stunden" },
      { attributeId: vorbereitungszeit!.id, name: "mehrere Tage" },
    ],
  })
}

async function main() {
  await userMigrations()
  await legalMigrations()
  await experimentSectionMigrations()
  await experimentAttributeMigrations()
  await experimentAttributeValueMigrations()
  await experimentMigrations()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
