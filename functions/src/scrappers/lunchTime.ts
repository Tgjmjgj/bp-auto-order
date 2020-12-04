import flatten from 'lodash/flatten';
import upperFirst from 'lodash/upperFirst';
import cheerio from 'cheerio';
import { DateTime } from 'luxon';
import got from 'got';

import { customDateFormat, log, throwError } from '../utils';
import { ScrapedMenu, ScrapedMenuItem } from '../../../types/autoOrderMenus';

const dateFormat = 'dd.MM.yyyy';
export const baseUrl = 'https://obed-office.ru';
const itemsMenuUrlCurrentWeek = baseUrl + '/catalog/tekushchaya-nedelya/?day=';
const itemsMenuUrlNextWeek = baseUrl + '/catalog/sleduyushchaya-nedelya/?day=';
const complexMenuUrlCurrentWeek = baseUrl + '/catalog/kompleks-menu-tekushchaya/?day=';
const complexMenuUrlNextWeek = baseUrl + '/catalog/kompleks-menu-sleduyushchaya/?day=';

export const scrapLunchTimeMenu = async (forDate: string): Promise<ScrapedMenu> => {
    log(`#Call: scrapLunchTimeMenu(forDate = ${forDate})`);
    try {
        const date = DateTime.fromFormat(forDate, customDateFormat);
        const today = DateTime.local().setZone('Europe/Moscow');
        const formattedDate = date.toFormat(dateFormat);
        const nextMonDay = today.day + 8 - today.weekday;
        const isNextWeek = date.day >= nextMonDay;

        const itemsMenuUrl = isNextWeek ? itemsMenuUrlNextWeek : itemsMenuUrlCurrentWeek;
        const response1 = await got(itemsMenuUrl + formattedDate);
        const $1 = cheerio.load(response1.body);

        const categories: string[] = $1('#catalog-ajax > .h2-h2').map((i, el) => {
            return upperFirst($1(el).text().trim().toLowerCase());
        }).get();
        const simpleMenuItems: ScrapedMenu = flatten($1('#catalog-ajax > .h2-h2 + .item-list').map((i1, el1) => {
            const category = categories[i1];
            return $1(el1).find('div[itemtype="http://schema.org/Product"]').map((i2, el2): ScrapedMenuItem => {
                const name = $1(el2).find('div[itemprop="name"]').text().trim();
                const description = $1(el2).find('meta[itemprop="description"]').attr('content')!.trim();
                const additional = description.length > name.length ? description.slice(name.length).trim() : description;
                const imageUrl = $1(el2).find('img.lazy').data('src');
                return {
                    name,
                    additional,
                    price: Number($1(el2).find('meta[itemprop="price"]').attr('content')!.trim()),
                    imageUrl: imageUrl ? baseUrl + imageUrl : null,
                    category,
                };
            }).get();
        }).get());

        const complexMenuUrl = isNextWeek ? complexMenuUrlNextWeek : complexMenuUrlCurrentWeek;
        const response2 = await got(complexMenuUrl + formattedDate);
        const $2 = cheerio.load(response2.body);

        const complexMenuItems: ScrapedMenu = $2('.kopmsostav').map((i1, el1) => {
            const additional = (
                $2(el1).find('.sostavlistkopleks li.ind-item > h5').map((i2, el2) => $2(el2).text().trim()).get() as string[]
            ).join(', ');
            return {
                name: $2(el1).find('.top > .block-name').text().trim(),
                additional,
                price: Number($2(el1).find('.pricekompl > .summkompleksa').text().trim()),
                imageUrl: null,
                category: 'Комплексные обеды',
            };
        }).get();

        return [
            ...simpleMenuItems,
            ...complexMenuItems,
        ];
    } catch (e) {
        throwError('unavailable', 'Error while scrapping LunchTime menu',e);
    }
    return [];
};
