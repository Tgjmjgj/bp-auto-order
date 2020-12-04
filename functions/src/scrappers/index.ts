
import { scrapKumirMenu, baseUrl as kumirBaseUrl } from './kumir';
import { scrapNamNymMenu, baseUrl as namNymBaseUrl } from './namNym';
import { scrapElunchMenu, baseUrl as elunchBaseUrl } from './elunch';
import { scrapLunchTimeMenu, baseUrl as lunchTimeBaseUrl } from './lunchTime';
import { scrapChanakhiMenu, baseUrl as chanakhiBaseUrl } from './chanakhi';
import { ScrapedMenu } from '../../../types/autoOrderMenus';

export const targetScrappers: Record<string, (date: string) => Promise<ScrapedMenu>> = {
    'kumir': scrapKumirMenu,
    'namnym': scrapNamNymMenu,
    'elunch': scrapElunchMenu,
    'lunchtime': scrapLunchTimeMenu,
    'chanakhi': scrapChanakhiMenu,
};

export const targetScrappersBaseUrls: Record<string, string> = {
    'kumir': kumirBaseUrl,
    'namnym': namNymBaseUrl,
    'elunch': elunchBaseUrl,
    'lunchtime': lunchTimeBaseUrl,
    'chanakhi': chanakhiBaseUrl,
};
