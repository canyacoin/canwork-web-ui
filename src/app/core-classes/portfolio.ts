export class Portfolio {
  work: Work[]
}

export class Work {
  description: string
  id: string
  image: string
  link: string
  state: WorkState
  tags: string[] = []
  timestamp: number
  title: string
}

export enum WorkState {
  done = 'Done',
}
