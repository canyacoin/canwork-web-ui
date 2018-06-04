import { State } from './state.enum';

export class Portfolio {
    work: Work[];
}

export class Work {
    description: string;
    id: string;
    image: string;
    link: string;
    state: State;
    tags: string[];
    timestamp: string;
    title: string;
}
