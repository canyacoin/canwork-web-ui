interface Scripts {
    name: string;
    src: string;
}

export const ScriptStore: Scripts[] = [
    { name: 'bancor', src: 'https://widget-convert.bancor.network/v1' },
    { name: 'bancor-config', src: 'assets/js/bancor-config.js' }
];
