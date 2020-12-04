import flatten from 'lodash/flatten';
import replace from 'lodash/replace';
import cheerio from 'cheerio';
import got from 'got';

import { log, throwError } from '../utils';
import { ScrapedMenu, ScrapedMenuItem } from '../../../types/autoOrderMenus';

type CategoryLink = {
    link: string
    name: string
};

export const baseUrl = 'http://www.dostavka.chanakhi.ru';
const restaurantMenuUrl = baseUrl + '/catalog/restoran/';
const storeMenuUrl = baseUrl + '/catalog/magazin/';
const urlParams = '?PAGE_EL_COUNT=ALL';

export const scrapChanakhiMenu = async (forDate: string): Promise<ScrapedMenu> => {
    log(`#Call: scrapChanakhiMenu()`);
    try {
        const categories = flatten(
            await Promise.all([restaurantMenuUrl, storeMenuUrl].map(url => {
                return got(url).then(response => {
                    const $ = cheerio.load(response.body);
                    const urlCategories: CategoryLink[] = 
                        $('article.inner-container .product-grid > a.tile.products-flex-item').map((i, el) => {
                            const category = {
                                link: baseUrl + $(el).attr('href') + urlParams,
                                name: $(el).find('span.catalog-category-name').text().trim(),
                            };
                            log(category);
                            return category;
                        }).get();
                    return urlCategories;
                });
            })),
        );
        log(categories);
        const processLink = async (link: CategoryLink): Promise<ScrapedMenuItem[]> => {
            const response = await got(link.link);
            const $ = cheerio.load(response.body);
            const subCategories = $('article.inner-container .product-grid > a.tile.products-flex-item');
            if (subCategories.length) {
                const newUrlCategories: CategoryLink[] = subCategories.map((i, el) => {
                    const category = {
                        link: baseUrl + $(el).attr('href') + urlParams,
                        name: $(el).find('span.catalog-category-name').text().trim(),
                    };
                    return category;
                }).get();
                return flatten(
                    await Promise.all(newUrlCategories.map(categoryLink => processLink(categoryLink))),
                );
            } else {
                return $('.catalog-content > .product-grid > .products-flex-item.isotope-item').map((i, el) => {
                    const priceStr = $(el).find('.price').text().trim();
                    const priceStrWithoutPriceSeparator = replace(priceStr, ' ', ''); // ' ' - that is not an ordinary space character...
                    const priceParts = priceStrWithoutPriceSeparator.split(' '); // ordinary space
                    const price = Number(priceParts.length ? priceParts[0] : priceStr);
                    const item = {
                        name: $(el).find('.name > span').text().trim(),
                        additional: '',
                        price: isNaN(price) ? 0 : price,
                        imageUrl: baseUrl + $(el).find('img.thumbnail').attr('src'),
                        category: link.name,
                    };
                    return item;
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
