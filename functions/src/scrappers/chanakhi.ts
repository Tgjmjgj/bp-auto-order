import flatten from 'lodash/flatten';
import cheerio from 'cheerio';
import got from 'got';

import { log, throwError } from '../utils';
import { ScrapedMenu, ScrapedMenuItem } from '../../../types/autoOrderMenus';

type CategoryLink = {
    link: string
    name: string
};

const baseUrl = 'http://www.dostavka.chanakhi.ru';
const restaurantMenuUrl = baseUrl + '/catalog/restoran/';
const storeMenuUrl = baseUrl + '/catalog/magazin/';
const urlParams = '?PAGE_EL_COUNT=ALL';

export const scrapChanakhiMenu = async (forDate: string): Promise<ScrapedMenu> => {
    log(`#Call: scrapChanakhiMenu()`);
    try {
        const categories: CategoryLink[] = [];
        await Promise.all([restaurantMenuUrl, storeMenuUrl].map(url => {
            return got(restaurantMenuUrl).then(response => {
                const $ = cheerio.load(response.body);
                const urlCategories: CategoryLink[] = 
                    $('article.inner-container .product-grid > a.tile.products-flex-item').map((i, el) => {
                        return {
                            link: baseUrl + $(el).attr('href') + urlParams,
                            name: $(el).find('span.catalog-category-name').text().trim(),
                        };
                    }).get();
                categories.push(...urlCategories);
            });
        }));

        const processLink = async (link: CategoryLink): Promise<ScrapedMenuItem[]> => {
            const response = await got(link.link);
            const $ = cheerio.load(response.body);
            const categories = $('article.inner-container .product-grid > a.tile.products-flex-item');
            if (categories.length) {
                const newUrlCategories: CategoryLink[] = categories.map((i, el) => {
                    return {
                        link: baseUrl + $(el).attr('href') + urlParams,
                        name: $(el).find('span.catalog-category-name').text().trim(),
                    };
                }).get();
                return flatten(
                    await Promise.all(newUrlCategories.map(categoryLink => processLink(categoryLink))),
                );
            } else {
                return $('.catalog-content > .product-grid > .products-flex-item.isotope-item').map((i, el) => {
                    return {
                        name: $(el).find('.name > span').text().trim(),
                        additional: '',
                        price: Number($(el).find('.price').text().trim()),
                        imageUrl: baseUrl + $(el).find('img.thumbnail').attr('src'),
                        category: link.name,
                    };
                }).get();
            }
        };

        const menu: ScrapedMenu = flatten(
            await Promise.all(categories.map(categoryLink => processLink(categoryLink))),
        );

        return menu;
    } catch (e) {
        throwError('unavailable', 'Error while scrapping Chanakhi menu', e);
    }
    return [];
};
