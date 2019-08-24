export type Auth = {
  uid: string
} | null

export interface IAllowDeny {
  read(title?: string): this
  create(data: firebase.firestore.DocumentData, title?: string): this
  update(data: firebase.firestore.UpdateData, title?: string): this
  delete(title?: string): this
}
