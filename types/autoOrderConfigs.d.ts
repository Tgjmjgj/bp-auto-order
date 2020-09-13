

export type OrderTarget = {
    id: string
    displayName: string
    isSystem: boolean
};

export type AutoOrderMode = 'preset' | 'random';

export type ConfigState = {
    enabled: boolean
    spreadsheetId: string
    mode: AutoOrderMode
    presets: OrderPreset[]
    selectedPresets: string[]
    savedTargets: OrderTarget[]
    randomConfigs: RandomOrderConfig[]
    selectedConfig: string
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

export type OrderItem = {
    id: string
    name: string
    price: number
    quantity: number
    target: string
    ref?: string
};

export type RandomConfigData = {
    total: {
        cost?: {
            min?: number
            mid?: number
            max?: number
        }
        maxItems?: number
        minItems?: number
    }
    selectFromTargets: string[]
    targetsData: Record<string, {
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
    }>
};

export type RandomOrderConfig = {
    id: string
    name: string
    config: RandomConfigData
};

export type PlaceOrderData = {
    spreadsheetId: string
    items: OrderItem[]
    targets: OrderTarget[]
    systemName?: string
    customName?: string
    overwrite?: boolean
    allowMultiple?: boolean
};
