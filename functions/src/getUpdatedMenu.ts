import * as FirebaseAdmin from 'firebase-admin';
import allSettled from 'promise.allsettled';
import fromEntries from 'object.fromentries';

import { scrapKumirMenu } from './scrapKumirMenu';
import { randomId, throwError } from './utils';
import { Menu, MenuTable, ScrapedMenu } from '../../types/autoOrderMenus';

const menuTargets = [ 'kumir' ];

const targetScrappers: Record<string, () => Promise<ScrapedMenu>> = {
    'kumir': scrapKumirMenu,
};

export const getAllUpdatedMenus = async () => {
    const result = await allSettled(menuTargets.map(target => {
        return getUpdatedMenu(target);
    }));
    return fromEntries(
        result.map((data, i) => {
            if (data.status === 'fulfilled') {
                return [ menuTargets[i], data.value ] as const;
            } else {
                return [ menuTargets[i], [] as Menu ] as const;
            }
        }),
    );
};
export const getUpdatedMenu = async (target: string): Promise<Menu> => {
    try {
        const docRef = FirebaseAdmin.firestore().collection(`auto-order-menus`).doc(target);
        const data = await docRef.get();
        const today = (new Date()).toDateString();
        if (data.exists) {
            const menuData = data.data() as MenuTable;
            if (menuData.updateDate === today) {
                return menuData.menu;
            }

            const todayMenuData = await targetScrappers[target]();
            todayMenuData.forEach(item => {
                const sameNameItem = menuData.menu.find(oldItem => oldItem.name === item.name);
                if (sameNameItem) {
                    sameNameItem.price = item.price;
                    sameNameItem.category = item.category;
                    sameNameItem.imageUrl = item.imageUrl;
                } else {
                    menuData.menu.push({
                        id: randomId(),
                        enabled: true,
                        ...item,
                    });
                }
            });
            const updatedMenu = menuData.menu.map(item => {
                const enabled = todayMenuData.find(todayItem => todayItem.name === item.name);
                return { ...item, enabled: !!enabled };
            });
            await docRef.update({
                updateDate: today,
                menu: updatedMenu,
            });
            return updatedMenu;
        }

        const firstMenuData = await scrapKumirMenu();
        const preparedMenu = firstMenuData.map(item => ({
            id: randomId(),
            enabled: true,
            ...item,
        }));
        await docRef.set({
            updateDate: today,
            menu: preparedMenu,
        });
        return preparedMenu;

    } catch (e) {
        throwError('aborted', 'Unknown error in getting the updated menu', e);
    }
    return [];
};
