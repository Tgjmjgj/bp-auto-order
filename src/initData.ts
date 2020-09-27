import { LocalConfigState } from './providers/ConfigStateProvider';
import { randomId } from './utils';
import { MenuItemConfig, RandomOrderConfig } from '../types/autoOrderConfigs';

export const defaultMenuItemConfig: MenuItemConfig = {
    weight: 1,
};

const defaultKumirTarget = { id: 'kumir', displayName: 'Ку-мир', isSystem: true };
const defaultChanakhiTarget = { id: 'chanakhi', displayName: 'Чанахи', isSystem: false };
const defaultNamNymTarget = { id: 'namnym', displayName: 'Нам-ням', isSystem: true };

const defaultPreset = {
    id: randomId(),
    name: 'Default preset',
    items: [
        { id: randomId(), name: 'Cувлаки', price: 140, quantity: 2, targetId: defaultChanakhiTarget.id },
    ],
};

export const pseudoIdPrefix = 'pseudoid_';

const defaultRandomConfig: RandomOrderConfig = {
    id: randomId(),
    name: 'Default Config',
    config: {
        total: {
            cost: { min: 270, mid: 300, max: 330 },
            minItems: 1,
            maxItems: 10,
        },
        selectFromTargets: [ defaultKumirTarget.id ],
        targetsData: {
            [defaultKumirTarget.id]: {
                categories: {
                    'Хлеб': { weight: 0, minItems: 0, maxItems: 0 },
                    'Одноразовая посуда': { weight: 0, minItems: 0, maxItems: 0 },
                    'Соусы и приправы': { weight: 0, minItems: 0, maxItems: 0 },
                    'Десерты, выпечка': { weight: 0, minItems: 0, maxItems: 0 },
                    'Буфетная продукция': { weight: 0, minItems: 0, maxItems: 0 },
                    'Напитки': { weight: 0, minItems: 0, maxItems: 0 },
                },
                items: {
                    [pseudoIdPrefix + '"Бульон мясной с сухариками" (300/25г)']: { weight: 0, minItems: 0, maxItems: 0 },
                    [pseudoIdPrefix + '"Сладкий Орешек" (240г)']: { weight: 0, minItems: 0, maxItems: 0 },
                    [pseudoIdPrefix + '"Сырник Шоколад" (220г)']: { weight: 0, minItems: 0, maxItems: 0 },
                    [pseudoIdPrefix + 'Каша рисовая с яблоками и ванилью (250г)']: { weight: 0, minItems: 0, maxItems: 0 },
                    [pseudoIdPrefix + 'Смузи клубнично-банановый (300г)']: { weight: 0, minItems: 0, maxItems: 0 },
                    [pseudoIdPrefix + 'Хлебцы ржаные (100г)']: { weight: 0, minItems: 0, maxItems: 0 },
                    [pseudoIdPrefix + 'Блинчики с мёдом (3/40/30г)']: { weight: 0, minItems: 0, maxItems: 0 },
                },
            },
            [defaultNamNymTarget.id]: {
                categories: {},
                items: {},
            },
        },
    },
};

export const defaultConfigState: LocalConfigState = {
    saveOnServer: false,

    enabled: false,
    spreadsheetId: '16A8ybyTrCyH6L3okYUgZW-GpYYPqttLj4PhSDYBPlYA',
    mode: 'preset',
    selectedPresets: [ defaultPreset.id ],
    presets: [ defaultPreset ],
    savedTargets: [ defaultKumirTarget, defaultChanakhiTarget, defaultNamNymTarget ],
    randomConfigs: [ defaultRandomConfig ],
    selectedConfig: defaultRandomConfig.id,
    overwriteAlways: false,
    allowMultipleOrders: false,
};
