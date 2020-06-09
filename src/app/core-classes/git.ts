export interface Issue {
  title: string
  state: string
  body: string
  description: string
}
export interface Repository {
  language: string
}
export interface DecoratedIssue {
  inputValues: {
    project: string
    issue: string    
  }
  error: string
  title: string
  state: string
  description: string
  language: string
}