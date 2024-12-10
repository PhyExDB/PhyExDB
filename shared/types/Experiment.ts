/**
 * ExperimentDetail
 */
export interface ExperimentList extends BaseList {
  /**
  * id.
  */
  id: string
  /**
   * userId of the user created by
   */
  userId: string
  /**
  * title.
  */
  title: string
  /**
  * The role of the user.
  */
  status: "Draft" | "Submitted" | "Accepted"
}
