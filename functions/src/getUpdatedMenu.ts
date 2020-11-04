import { firestore } from './firebase';
import { scrapKumirMenu } from './scrappers/kumir';
import { scrapNamNymMenu } from './scrappers/namNym';
import { scrapElunchMenu } from './scrappers/elunch';
import { scrapLunchTimeMenu } from './scrappers/lunchTime';
import { randomId, log, throwError, checkDate } from './utils';
import { UpdatedMenu, MenuItem, MenuItemsTable, ScrapedMenu } from '../../types/autoOrderMenus';

const menuTargets = [ 'kumir', 'namnym', 'elunch' ];

export const targetScrappers: Record<string, (date: string) => Promise<ScrapedMenu>> = {
    'kumir': scrapKumirMenu,
    'namnym': scrapNamNymMenu,
    'elunch': scrapElunchMenu,
    'lunchtime': scrapLunchTimeMenu,
};

export const getAllUpdatedMenus = async (forDate: string) => {
    log(`#Call: getAllUpdatedMenus(forDate = ${forDate})`);
    checkDate(forDate);
    const result = await Promise.allSettled(menuTargets.map(target => {
        return getUpdatedMenu(target, forDate);
    }));
    return Object.fromEntries(
        result.map((data, i) => {
            if (data.status === 'fulfilled') {
                return [ menuTargets[i], data.value ] as const;
            } else {
                return [ menuTargets[i], [] as UpdatedMenu ] as const;
            }
        }),
    );
};

export const getUpdatedMenu = async (targetId: string, forDate: string): Promise<UpdatedMenu> => {
    log(`#Call: getUpdatedMenu(target = ${targetId}, forDate = ${forDate})`);
    checkDate(forDate);
    try {
        const itemsTableRef = firestore.collection('auto-order-menu-items').doc(targetId);
        const availabilityTableRef = firestore.collection('auto-order-menu-availability').doc(forDate);
        const [itemsData, availabilityData] = await Promise.all([
            itemsTableRef.get(),
            availabilityTableRef.get(),
        ]);

        let allMenuItems: MenuItem[] = [];
        let availableMenuForDate: string[] = [];
        if (itemsData.exists) {
            allMenuItems = (itemsData.data() as MenuItemsTable).menuItems;
        }
        if (availabilityData.exists) {
            const availableMenu = availabilityData.get(targetId) as string[] | undefined;
            if (availableMenu && availableMenu.length) {
                availableMenuForDate = availableMenu;
            }
        }
        if (!allMenuItems.length || !availableMenuForDate.length) {

            const menuDataForDate = await targetScrappers[targetId](forDate);
            availableMenuForDate = menuDataForDate.map(item => {
                const sameNameItem = allMenuItems.find(oldItem => {
                    return (oldItem.name === item.name && oldItem.additional === item.additional);
                });
                let itemId;
                if (sameNameItem) {
                    sameNameItem.additional = item.additional;
                    sameNameItem.price = item.price;
                    sameNameItem.category = item.category;
                    sameNameItem.imageUrl = item.imageUrl;
                    itemId = sameNameItem.id;
                } else {
                    itemId = randomId();
                    allMenuItems.push({
                        id: itemId,
                        targetId,
                        ...item,
                    });
                }
                return itemId;
            });

            const itemsSetOrUpdate = itemsData.exists ? 'update' : 'set';
            const availabilitySetOrUpdate = availabilityData.exists ? 'update' : 'set';

            await Promise.all([
                firestore.collection('auto-order-menu-items').doc(targetId)[itemsSetOrUpdate](
                    { menuItems: allMenuItems },
                ),
                firestore.collection('auto-order-menu-availability').doc(forDate)[availabilitySetOrUpdate](
                    { [targetId]: availableMenuForDate },
                ),
            ]);
        }

        return allMenuItems.map(menuItem => {
            const isEnabled = availableMenuForDate.includes(menuItem.id);
            return {
                ...menuItem,
                enabled: isEnabled,
            };
        });

    } catch (e) {
        throwError('aborted', 'Unknown error in getting the updated menu', e);
    }
    return [];
};
