export type Auth = {
  uid: string
} | null

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

export interface Data {
  [k: string]: Record<string, any>
}

export interface TestFactoryContext {
  db: Promise<firebase.firestore.Firestore>
  path: string
  auth: Auth
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

export interface AllowDenyTable {
  read(options?: Partial<ReadOptions>): this
  create(options?: Partial<CreateOptions>): this
  update(options?: Partial<UpdateOptions>): this
  delete(options?: Partial<DeleteOptions>): this
  table(): Table
}

export interface AllowTable {
  deny(): DenyTable
}

export interface DenyTable {
  allow(): AllowTable
}

export type TableFn = (allowDeny: {
  allow: AllowTable
  deny: DenyTable
}) => Table

export interface DescribeContext {
  name: string
  rules: string
  path: string
  auth: Auth
  data?: Data
  timeout?: number
}
