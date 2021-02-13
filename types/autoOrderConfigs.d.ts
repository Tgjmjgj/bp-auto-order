
type OrderItemId = string;
type MenuItemId = string;
type TargetId = string;
type PresetId = string;
type RandomConfigId = string;

export type OrderTarget = {
    id: TargetId
    displayName: string
    isSystem: boolean
};

export type AutoOrderMode = 'preset' | 'random';

export type ConfigState = {
    enabled: boolean
    spreadsheetId: string
    mode: AutoOrderMode
    presets: OrderPreset[]
    selectedPresets: PresetId[]
    savedTargets: OrderTarget[]
    randomConfigs: RandomOrderConfig[]
    selectedConfig: RandomConfigId
    overwriteAlways: boolean
    allowMultipleOrders: boolean
    systemName?: string
    customName?: string
};

export type OrderPreset = {
    id: PresetId
    name: string
    items: OrderItem[]
};

export type OrderItem = {
    id: OrderItemId
    name: string
    price: number
    quantity: number
    targetId: TargetId
    menuItemId?: MenuItemId
};

export type MenuItemConfig = {
    weight: number
    maxItems?: number
    minItems?: number
};

export type Costs = {
    min: number
    mid: number
    max: number
};

export type ConfigTargetsData = Record<TargetId, {
    categories: Record<string, MenuItemConfig>
    items: Record<MenuItemId, MenuItemConfig>
}>;

export type RandomConfigData = {
    total: {
        cost: Costs
        minItems: number
        maxItems: number
    }
    selectFromTargets: TargetId[]
    autoDetectTarget: boolean
    targetsData: ConfigTargetsData
};

export type RandomOrderConfig = {
    id: RandomConfigId
    name: string
    config: RandomConfigData
};
