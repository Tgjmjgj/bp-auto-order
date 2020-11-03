import flatten from 'lodash/flatten';
import upperFirst from 'lodash/upperFirst';
import cheerio from 'cheerio';
import { DateTime } from 'luxon';
import got from 'got';

import { customDateFormat, log, throwError } from '../utils';
import { ScrapedMenu, ScrapedMenuItem } from '../../../types/autoOrderMenus';

const dateFormat = 'dd.MM.yyyy';
const baseUrl = 'https://obed-office.ru';
const menuUrlCurrentWeek = baseUrl + '/catalog/tekushchaya-nedelya/?day=';
const menuUrlNextWeek = baseUrl + '/catalog/sleduyushchaya-nedelya/?day=';

export const scrapLunchTimeMenu = async (forDate: string): Promise<ScrapedMenu> => {
    log(`#Call: scrapLunchTimeMenu(forDate = ${forDate})`);
    try {
        const date = DateTime.fromFormat(forDate, customDateFormat);
        const today = DateTime.local().setZone('Europe/Moscow');
        const formattedDate = date.toFormat(dateFormat);
        const nextMonDay = today.day + 8 - today.weekday;
        const isNextWeek = date.day >= nextMonDay;
        const menuUrl = isNextWeek ? menuUrlNextWeek : menuUrlCurrentWeek;
        const response = await got(menuUrl + formattedDate);
        const $ = cheerio.load(response.body);

        const categories: string[] = $('#catalog-ajax > .h2-h2').map((i, el) => {
            return upperFirst($(el).text().trim().toLowerCase());
        }).get()
        const menu: ScrapedMenu = flatten($('#catalog-ajax > .h2-h2 + .item-list').map((i1, el1) => {
            const category = categories[i1];
            return $(el1).find('div[itemtype="http://schema.org/Product"]').map((i2, el2): ScrapedMenuItem => {
                const name = $(el2).find('div[itemprop="name"]').text().trim();
                const description = $(el2).find('meta[itemprop="description"]').attr('content')!.trim();
                const additional = description.length > name.length ? description.slice(name.length).trim() : description;
                const imageUrl = $(el2).find('img.lazy').data('src');
                return {
                    name,
                    additional,
                    price: Number($(el2).find('meta[itemprop="price"]').attr('content')!.trim()),
                    imageUrl: imageUrl ? baseUrl + imageUrl : null,
                    category,
                };
            }).get();
        }).get());

        return menu;
    } catch (e) {
        throwError('unavailable', 'Error while scrapping LunchTime menu',e);
    }
    return [];
};
