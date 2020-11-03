import cheerio from 'cheerio';
import { DateTime } from 'luxon';
import got from 'got';

import { customDateFormat, log, throwError } from '../utils';
import { ScrapedMenu, ScrapedMenuItem } from '../../../types/autoOrderMenus';

const dateFormat = 'dd-MM-yyyy';
const baseUrl = 'https://e-lunch.ru';
const menuUrl = baseUrl + '/menu/?date=';

export const scrapElunchMenu = async (forDate: string): Promise<ScrapedMenu> => {
    log(`#Call: scrapElunchMenu(forDate = ${forDate})`);
    try {
        const formattedDate = DateTime.fromFormat(forDate, customDateFormat).toFormat(dateFormat);
        const response = await got(menuUrl + formattedDate);
        const $ = cheerio.load(response.body);

        const menu: ScrapedMenu = $('.w_dish_item.e_dish').map((i, el): ScrapedMenuItem => {
            const imageUrl = $(el).find('.w_dish_item_img_wrap > img').data('original');
            const compositionTitle = $(el).find('.w_dish_item_img_wrap > .hover-description > b').text().trim() || ''
            const compositionList = $(el).find('.w_dish_item_img_wrap > .hover-description > span').text().trim() || ''
            return {
                name: $(el).find('[itemprop="name"]').text().trim(),
                additional: compositionTitle + ' ' + compositionList,
                price: Number($(el).find('[itemprop="price"]').text().trim()),
                imageUrl: imageUrl ? baseUrl + imageUrl : null,
                category: $(el).find('.w_dish_item__category').text().trim(),
            };
        }).get();

        return menu;
    } catch (e) {
        throwError('unavailable', 'Error while scrapping Elunch menu',e);
    }
    return [];
};
