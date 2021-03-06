import flatten from 'lodash/flatten';
import cheerio from 'cheerio';
import { DateTime } from 'luxon';
import got from 'got';

import { customDateFormat, log, throwError } from '../utils';
import { ScrapedMenu, ScrapedMenuItem } from '../../../types/autoOrderMenus';

const dateFormat = 'dd-MM-yyyy';
export const baseUrl = 'https://ku-mir.ru';
const menuUrl = baseUrl + '/menu/?date=';

export const scrapKumirMenu = async (forDate: string): Promise<ScrapedMenu> => {
    log(`#Call: scrapKumirMenu(forDate = ${forDate})`);
    try {
        const formattedDate = DateTime.fromFormat(forDate, customDateFormat).toFormat(dateFormat);
        const response = await got(menuUrl + formattedDate);
        const $ = cheerio.load(response.body);

        const menu: ScrapedMenu = flatten($('.table-menu-items tbody').map((i1, el1) => {
            const category = $(el1).find('tr:first-child > td').text().trim()
            return $(el1).find('tr:not(:first-child) > td').map((i2, el2): ScrapedMenuItem => {
                const imageUrl = $(el2).find('.tr-item-img img').data('original');
                return {
                    name: $(el2).find('.name-dish').text().trim(),
                    additional: '',
                    price: Number($(el2).find('.nb-price.tr-item-price').text()),
                    imageUrl: imageUrl ? baseUrl + imageUrl : null,
                    category,
                };
            }).get();
        }).get());

        return menu;
    } catch (e) {
        throwError('unavailable', 'Error while scrapping KuMir menu',e);
    }
    return [];
};
