import Apify from 'apify';
import flatten from 'lodash/flatten';
import {KumirMenu} from '../../types/autoOrderMenus';

const kumirBaseUrl = 'https://ku-mir.ru';
const kumirMenuUrl = kumirBaseUrl + '/menu';

export const scrapKumirMenu = () => {
    return new Promise<KumirMenu>((resolve, reject) => {
        Apify.main(async () => {
            
            const requestList = new Apify.RequestList({
                sources: [{ url: kumirMenuUrl }],
            });
            await requestList.initialize();
            const crawler = new Apify.CheerioCrawler({
                requestList,
                handlePageFunction: async ({ $ }) => {

                    if (!$) {
                        setTimeout(() => reject('CheerioCrawler: $ is undefiend'));
                        return;
                    }
                    try {
                        const menu = flatten($('.table-menu-items tbody').map((i1, el1) => {
                            const category = $(el1).find('tr:first-child > td').text().trim()
                            return $(el1).find('tr:not(:first-child) > td').map((i2, el2) => {
                                return {
                                    name: $(el2).find('.name-dish').text().trim(),
                                    price: Number($(el2).find('.nb-price.tr-item-price').text()),
                                    imageUrl: $(el2).find('.tr-item-img img').data('original'),
                                    category,
                                };
                            }).get();
                        }).get());
                        resolve(menu);
                    } catch (e) {
                        setTimeout(() => reject('Error while scrapping the KuMir menu: ' + e));
                    }
                },
            });
            await crawler.run();
        });
    });
};