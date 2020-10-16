import { firestore } from './firebase';
import { targetScrappers } from './getUpdatedMenu';
import { log, checkDate, throwError, randomId } from './utils';
import { MenuItemsTable } from '../../types/autoOrderMenus';

export const getAvailableMenu = async (targetId: string, forDate: string) => {
    log(`#Call: getAvailableMenu(target = ${targetId}, forDate = ${forDate})`);
    checkDate(forDate);
    try {
        const availabilityTableRef = firestore.collection('auto-order-menu-availability').doc(forDate);
        const availabilityData = await availabilityTableRef.get();

        if (availabilityData.exists) {
            const availableMenu = availabilityData.get(targetId) as string[] | undefined;
            if (availableMenu && availableMenu.length) {
                return availableMenu;
            }
        }

        const itemsTableRef = firestore.collection('auto-order-menu-items').doc(targetId);
        const itemsData = await itemsTableRef.get();
        const allMenuItems = itemsData.exists ? (itemsData.data() as MenuItemsTable).menuItems : [];

        const menuDataForDate = await targetScrappers[targetId](forDate);
        const availableMenuForDate = menuDataForDate.map(item => {
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

        return availableMenuForDate;
    } catch (e) {
        throwError('aborted', 'Unknown error in getting the menu availability data', e);
    }
    return [];
};
