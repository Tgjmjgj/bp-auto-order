import { DateTime } from 'luxon';

import { firestore } from './firebase';
import { scrapKumirMenu } from './scrappers/scrapKumirMenu';
import { scrapNamNymMenu } from './scrappers/scrapNamNymMenu';
import { randomId, log, throwError } from './utils';
import { UpdatedMenu, MenuItem, MenuItemsTable, ScrapedMenu } from '../../types/autoOrderMenus';

const menuTargets = [ 'kumir', 'namnym' ];

const targetScrappers: Record<string, (date: string) => Promise<ScrapedMenu>> = {
    'kumir': scrapKumirMenu,
    'namnym': scrapNamNymMenu,
};

export const customDateFormat = 'yyyy-MM-dd'

const checkDate = (forDate: string) => {
    try {
        const date = DateTime.fromFormat(forDate, customDateFormat);
        if (!date.isValid) {
            throw Error();
        }
        const dateDiff = date.diffNow(['month', 'day']);
        if (dateDiff.months < 0) {
            throwError('invalid-argument', 'You can retrieve menu only for past priods no longer than 1 month from today.');
        }
        if (dateDiff.months > 0 || dateDiff.days > 7) {
            throwError('invalid-argument', 'You can retrieve menu only for future periods no longer than 1 week from today.');
        }
    } catch (e) {
        throwError('invalid-argument', `Date is invalid. Expected string format: "${customDateFormat}"`, e);
    }
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
        let latestAvailableMenu: string[] = [];
        if (itemsData.exists) {
            allMenuItems = (itemsData.data() as MenuItemsTable).menuItems;
        }
        if (availabilityData.exists) {
            const availableMenu = availabilityData.get(targetId) as string[] | undefined;
            if (availableMenu && availableMenu.length) {
                latestAvailableMenu = availableMenu;
            }
        }
        if (!allMenuItems.length || !latestAvailableMenu.length) {

            const todayMenuData = await targetScrappers[targetId](forDate);
            latestAvailableMenu = [];
            todayMenuData.forEach(item => {
                const sameNameItem = allMenuItems.find(oldItem => oldItem.name === item.name);
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
                latestAvailableMenu.push(itemId);
            });

            const itemsSetOrUpdate = itemsData.exists ? 'update' : 'set';
            const availabilitySetOrUpdate = availabilityData.exists ? 'update' : 'set';

            await Promise.all([
                firestore.collection('auto-order-menu-items').doc(targetId)[itemsSetOrUpdate](
                    { menuItems: allMenuItems },
                ),
                firestore.collection('auto-order-menu-availability').doc(forDate)[availabilitySetOrUpdate](
                    { [targetId]: latestAvailableMenu },
                ),
            ]);
        }

        return allMenuItems.map(menuItem => {
            const isEnabled = latestAvailableMenu.includes(menuItem.id);
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
