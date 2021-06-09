import { LocalConfigState } from './providers/ConfigStateProvider';
import { randomId } from './utils';
import { MenuItemConfig, RandomConfigData, RandomOrderConfig } from '../types/autoOrderConfigs';

export const defaultMenuItemConfig: MenuItemConfig = {
    weight: 1,
};

const defaultKumirTarget = { id: 'kumir', displayName: 'Ку-мир', isSystem: true };
const defaultChanakhiTarget = { id: 'chanakhi', displayName: 'Чанахи', isSystem: true };
const defaultNamNymTarget = { id: 'namnym', displayName: 'Нам-ням', isSystem: true };
const defaultElunchTarget = { id: 'elunch', displayName: 'Е-ланч', isSystem: true };
const defaultLunchTimeTarget = { id: 'lunchtime', displayName: 'LunchTime', isSystem: true };

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
            cost: { min: 260, mid: 290, max: 310 },
            minItems: 1,
            maxItems: 10,
        },
        selectFromTargets: [ defaultKumirTarget.id ],
        autoDetectTarget: false,
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
            [defaultElunchTarget.id]: {
                categories: {},
                items: {},
            },
            [defaultLunchTimeTarget.id]: {
                categories: {},
                items: {},
            },
            [defaultChanakhiTarget.id]: {
                categories: {},
                items: {},
            },
        },
    },
};

export const defaultConfigState: LocalConfigState = {
    enabled: false,
    spreadsheet: {
        id: '16A8ybyTrCyH6L3okYUgZW-GpYYPqttLj4PhSDYBPlYA',
        tabHeading: 'Sheet1',
    },
    mode: 'preset',
    selectedPresets: [ defaultPreset.id ],
    presets: [ defaultPreset ],
    savedTargets: [
        defaultKumirTarget,
        defaultChanakhiTarget,
        defaultNamNymTarget,
        defaultElunchTarget,
        defaultLunchTimeTarget,
    ],
    randomConfigs: [ defaultRandomConfig ],
    selectedConfig: defaultRandomConfig.id,
    overwriteAlways: false,
    allowMultipleOrders: false,
};

export const defaultEmptyRandomConfigData: RandomConfigData = {
    total: {
        cost: { min: 260, mid: 290, max: 310 },
        minItems: 1,
        maxItems: 10,
    },
    selectFromTargets: [ defaultNamNymTarget.id ],
    autoDetectTarget: true,
    targetsData: {
        [defaultKumirTarget.id]: {
            categories: {},
            items: {},
        },
        [defaultNamNymTarget.id]: {
            categories: {},
            items: {},
        },
        [defaultElunchTarget.id]: {
            categories: {},
            items: {},
        },
        [defaultLunchTimeTarget.id]: {
            categories: {},
            items: {},
        },
        [defaultChanakhiTarget.id]: {
            categories: {},
            items: {},
        },
    },
};
