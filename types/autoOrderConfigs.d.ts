

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
    ref?: string
};

export type RandomOrderConfig = {
    total: {
        cost?: {
            min?: number
            mid?: number
            max?: number
        }
        maxItems?: number
        minItems?: number
    }
    categories: Record<string, {
        weight?: number
        maxItems?: number
        minItems?: number
    }>
    items: Record<string, {
        weight?: number
        maxItems?: number
        minItems?: number
    }>
};