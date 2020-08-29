import { RandomOrderConfig } from '../../types/autoOrderConfigs';

export const defaultRandomOrderConfig: RandomOrderConfig = {
    total: {
        cost: { min: 270, mid: 300, max: 350 },
    },
    categories: {
        'Хлеб': { weight: 0 },
        'Одноразовая посуда': { weight: 0 },
        'Соусы и приправы': { weight: 0 },
        'Десерты, выпечка': { weight: 0 },
        'Буфетная продукция': { weight: 0 },
        'Напитки': { weight: 0 },
    },
    items: {
        '"Бульон мясной с сухариками" (300/25г)': { weight: 0 },
        '"Сладкий Орешек" (240г)': { weight: 0 },
        '"Сырник Шоколад" (220г)': { weight: 0 },
        'Каша рисовая с яблоками и ванилью (250г)': { weight: 0 },
        'Смузи клубнично-банановый (300г)': { weight: 0 },
        'Хлебцы ржаные (100г)': { weight: 0 },
        'Блинчики с мёдом (3/40/30г)': { weight: 0 },
    },
};
