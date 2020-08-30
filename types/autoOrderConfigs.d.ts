

export type OrderTarget = {
    id: string
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
    overwriteAlways: boolean
    allowMultipleOrders: boolean
    systemName?: string
    customName?: string
};

export type OrderPreset = {
    id: string
    name: string
    items: OrderItem[]
};

export interface OrderItem {
    id: string
    name: string
    price: number
    quantity: number
    target: string
    ref?: string
}

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

export type PlaceOrderData = {
    spreadsheetId: string
    items: OrderItem[]
    targets: OrderTarget[]
    systemName?: string
    customName?: string
    overwrite?: boolean
};
