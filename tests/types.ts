export type Auth = {
  uid: string
} | null

export type Allow = 'read' | 'create' | 'update' | 'delete'

export interface Test {
  path: string
  auth: Auth
  allow: Allow[]
}

export interface Case {
  describe: string
  data: Record<string, any>
  rules: string
  tests: Test[]
}

export interface TestCases {
  cases: Case[]
}
