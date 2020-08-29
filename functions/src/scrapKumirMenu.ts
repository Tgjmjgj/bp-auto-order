import flatten from 'lodash/flatten';
import cheerio from 'cheerio';
import got from 'got';
import { ScrapedMenu, ScrapedMenuItem } from '../../types/autoOrderMenus';
import { throwError } from './utils';

const kumirBaseUrl = 'https://ku-mir.ru';
const kumirMenuUrl = kumirBaseUrl + '/menu';

export const scrapKumirMenu = async (): Promise<ScrapedMenu> => {
    try {
        const response = await got(kumirMenuUrl);
        const $ = cheerio.load(response.body);
        const menu: ScrapedMenu = flatten($('.table-menu-items tbody').map((i1, el1) => {
            const category = $(el1).find('tr:first-child > td').text().trim()
            return $(el1).find('tr:not(:first-child) > td').map((i2, el2): ScrapedMenuItem => {
                const imageUrl = $(el2).find('.tr-item-img img').data('original');
                return {
                    name: $(el2).find('.name-dish').text().trim(),
                    price: Number($(el2).find('.nb-price.tr-item-price').text()),
                    imageUrl: imageUrl ? kumirBaseUrl + imageUrl : null,
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
