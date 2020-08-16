

export type OrderTarget = {
    id: string
    key: string
    displayName: string
};

export type AutoOrderMode = 'preset' | 'random';

export type ConfigState = {
    enabled: boolean
    spreadsheetId: string
    mode: AutoOrderMode
    presets: OrderPreset[]
    selectedPresets: string[]
    savedTargets: OrderTarget[]
    systemName?: string
    customName?: string
};

export type OrderPreset = {
    id: string
    name: string
    items: OrderItem[]
};

export type OrderItem = {
    id: string
    name: string
    price: number
    quantity: number
    target: string
};

export type RandomOrderConfig = {
    cost: number[]
    categories: Record<string, {
        maxItems: number
    }>
};
