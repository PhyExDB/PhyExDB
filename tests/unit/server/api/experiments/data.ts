import { v4 as uuidv4 } from "uuid"
import { users } from "~~/tests/helpers/auth"

/** An array of ressource lists */
export const lists: ExperimentList[] = [
  {
    id: uuidv4(),
    slug: "name",
    name: "name",
    userId: users.user.id,
    status: "DRAFT",
    duration: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviews: [],
    attributes: [
      {
        id: uuidv4(),
        name: "attribute",
        slug: "attribute",
        order: 1,
        multipleSelection: true,
        values: [
          {
            id: uuidv4(),
            value: "value",
            slug: "value",
          },
          {
            id: uuidv4(),
            value: "value2",
            slug: "value2",
          },
        ],
      },
    ],
    previewImage: {
      id: uuidv4(),
      path: "previewImage path",
      mimeType: "img/png",
    },
    revisedBy: undefined,
    revisionOf: undefined,
    ratingsSum: 0,
    ratingsCount: 0,
  },
  {
    id: uuidv4(),
    slug: "name2",
    name: "name2",
    userId: users.user.id,
    status: "DRAFT",
    duration: 1,
    attributes: [],
    previewImage: undefined,
    revisedBy: undefined,
    revisionOf: undefined,
    ratingsSum: 0,
    ratingsCount: 0,
  },
] as ExperimentList[]

/** A resource detail */
export const detail: ExperimentDetail = {
  ...lists[0]!,
  updatedAt: new Date().toISOString(),
  reviews: [],
  sections: [{
    id: uuidv4(),
    text: "text",
    files: [],
    experimentSection: {
      id: uuidv4(),
      name: "name",
      slug: "slug",
      order: 1,
    },
  }],
  changeRequest: undefined,
  completedReviewsCount: 0,
  alreadyReviewedByMe: false,
}

function attributesToDb(attributes: ExperimentList["attributes"]): ExperimentIncorrectList["attributes"] {
  return attributes.flatMap((attr) => {
    return attr.values.map((val) => {
      return {
        attribute: attr,
        ...val,
      }
    })
  }).sort((a, b) => a.attribute.order - b.attribute.order)
}

/** the lists in db */
export const listsDb = lists.map((exp) => {
  return {
    ...exp,
    attributes: attributesToDb(exp.attributes),
  }
}) satisfies ExperimentIncorrectList[]

/** the detail in db */
export const detailDb = {
  ...detail,
  attributes: attributesToDb(detail.attributes),
}
