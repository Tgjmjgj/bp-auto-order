import { OrderItem } from '../../types/autoOrderConfigs';
import { defaultRandomOrderConfig } from './defaults';
import { getUpdatedMenu } from './getUpdatedMenu';
import { randomizeItems } from './randomizeItems';

export type GetRandomOrderResult = {
    status: number
    data: {
        success?: boolean
        items?: OrderItem[]
        reason?: string
        error?: string
    }
};

export const getRandomOrder = async (target: string): Promise<GetRandomOrderResult> => {
    const menu = await getUpdatedMenu(target);
    if (menu) {
        const items = await randomizeItems(target, menu, defaultRandomOrderConfig);
        if (items) {
            return {
                status: 200,
                data: {
                    success: true,
                    items,
                },
            };
        } else {
            return {
                status: 500,
                data: {
                    success: false,
                    error: 'Cannot get items from provided menu. Please, contact the developer.',
                },
            };
        }
    } else {
        return {
            status: 404,
            data: {
                success: false,
                reason: `Menu for target '${target} is not available.`,
            },
        };
    }
}
