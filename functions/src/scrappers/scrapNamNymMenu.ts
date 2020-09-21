import flatten from 'lodash/flatten';
import cheerio from 'cheerio';
import { DateTime } from 'luxon';
import got from 'got';

import { log, throwError } from '../utils';
import { ScrapedMenu, ScrapedMenuItem } from '../../../types/autoOrderMenus';

const namNymBaseUrl = 'https://www.nam-nyam.ru/';
const namNymMenuUrl = namNymBaseUrl + '/catering/?curDay=';

export const scrapNamNymMenu = async (enUsDate: string): Promise<ScrapedMenu> => {
    log(`#Call: scrapNamNymMenu(enUsDate = ${enUsDate})`);
    try {
        const formattedDate = DateTime.fromFormat(enUsDate, 'dd/MM/yyyy').toFormat('dd.MM.yyyy');
        const response = await got(namNymMenuUrl + formattedDate);
        const $ = cheerio.load(response.body);

        const menu: ScrapedMenu = flatten($('.goods_tbl.cataringForm > div').map((i1, el1) => {
            const category = $(el1).find('div.h2').text().trim();
            
            const complexItems = $(el1).find('.catering_item.included_item').map((i2, el2): ScrapedMenuItem => {
                const priceStr = $(el2).find('meta[itemprop="price"]').attr("content")!.trim();
                const includedItems = $(el2).find('.list_included_item a > span.complex_tooltip')
                    .map((i3, el3) => $(el3).text().trim()).get();
                return {
                    name: $(el2).find('meta[itemprop="name"]').attr("content")!.trim(),
                    additional: 'Включает: ' + includedItems.join(', '),
                    price: Number(priceStr.slice(0, priceStr.length - ' руб.'.length)),
                    imageUrl: null,
                    category: $(el2).find('meta[itemprop="description"]').attr("content")!.trim(),
                };
            }).get();
            const singleItems = $(el1).find('.catering_item:not(.included_item) > .catering_item_wrapper').map((i2, el2): ScrapedMenuItem => {
                const imageUrl = $(el2).find('meta[itemprop="image"]').attr("content")!.trim();
                const description = $(el2).find('meta[itemprop="description"]').attr("content")!.trim();
                const weight = $(el2).find('a[title] .catering_item_weight').text().trim();
                const priceStr = $(el2).find('.catering_item_price > span.price').attr("content")!.trim();
                return {
                    name: $(el2).find('meta[itemprop="name"]').attr("content")!.trim(),
                    additional: weight + '. Состав: ' + description,
                    price: Number(priceStr.slice(0, priceStr.length - ' руб.'.length)),
                    imageUrl: imageUrl ? namNymMenuUrl + imageUrl : null,
                    category,
                };
            }).get();
            return [ ...complexItems, ...singleItems ];
        }).get());

        return menu;
    } catch (e) {
        throwError('unavailable', 'Error while scrapping NamNym menu',e);
    }
    return [];
};
