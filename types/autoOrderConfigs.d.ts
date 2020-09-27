

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
    targetId: string
    menuItemId?: string
};

export type MenuItemConfig = {
    weight: number
    maxItems?: number
    minItems?: number
};

export type RandomConfigData = {
    total: {
        cost: {
            min: number
            mid: number
            max: number
        }
        minItems: number
        maxItems: number
    }
    selectFromTargets: string[]
    targetsData: Record<string, {
        categories: Record<string, MenuItemConfig>
        items: Record<string, MenuItemConfig>
    }>
};

export type RandomOrderConfig = {
    id: string
    name: string
    config: RandomConfigData
};

export interface PlaceOrderData {
    spreadsheetId: string
    forDate: string
    items: OrderItem[]
    targets: OrderTarget[]
    systemName?: string
    customName?: string
    overwrite?: boolean
    allowMultiple?: boolean
}

export interface Rate {
    total: number
}

export interface MenuItemRating {
    id: string
    itemId: string
    targetId: string
    userId: string
    rate: Rate
    comment: string
}

type MenuItemId = string;
export type TargetRatings = Record<MenuItemId, MenuItemRating>;

export interface OrderHistoryItem {
    id: string
    datetime: UTC_ISO_Date
    orderData: PlaceOrderData
    row: number
    itemsRatings: string[] // id[] of MenuItemRating
    orderRate?: Rate
}

type UTC_ISO_Date = string; // DateTime.local().toUTC().toISO({suppressMilliseconds: true, suppressSeconds: true})
export type OrderHistory = Record<UTC_ISO_Date, OrderHistoryItem>;
