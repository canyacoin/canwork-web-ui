import { State } from './state.enum';

export class User {
    address: string;
    avatar: Avatar;
    bio: string;
    category: string;
    colors: string[];
    description: string;
    email: string;
    name: string;
    phone: string;
    state: State;
    timestamp: string;
    timezone: string;
    title: string;
    type: string;
    work: string;
}

export class Avatar {
    uri: string;
}
