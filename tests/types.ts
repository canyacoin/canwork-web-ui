export type Auth = {
  uid: string
} | null

// export interface IAllowDenyOptions {
//   rules: string
//   path: string
//   auth: Auth
//   data: any
//   suffix: string
// }

export interface ReadOptions {
  suffix: string
}

export interface CreateOptions {
  data: firebase.firestore.DocumentData
  id: string
  suffix: string
}

export interface UpdateOptions {
  data: firebase.firestore.UpdateData
  suffix: string
}

export interface DeleteOptions {
  suffix: string
}

// export interface AllowDenyParams {
//   rules: string
//   path: string
//   auth: Auth
//   data: any
//   suffix?: string
// }

// export interface AllowDenyActions {
//   read(
//     options?: Partial<ReadOptions>
//   ): Promise<
//     firebase.firestore.DocumentSnapshot | firebase.firestore.QuerySnapshot
//   >
//   create(options?: Partial<CreateOptions>): Promise<void>
//   update(options?: Partial<UpdateOptions>): Promise<void>
//   delete(options?: Partial<DeleteOptions>): Promise<void>
// }
// export type AllowDenyFn = (actions: AllowDenyActions) => Promise<void>

export interface Data {
  [k: string]: Record<string, any>
}
export interface Context {
  db: Promise<firebase.firestore.Firestore>
  rules: string
  path: string
  auth: Auth
  data: Data
  timeout?: number
}

export enum Actions {
  Read = 'read',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export interface Row {
  isAllow: boolean
  action: Actions
  options?: Partial<ReadOptions | CreateOptions | UpdateOptions | DeleteOptions>
}

export type Table = Row[]
