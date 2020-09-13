
export type ScrapedMenuItem = {
    name: string
    price: number
    imageUrl: string | null
    category: string
};

export type MenuItem = {
    id: string
    name: string
    price: number
    imageUrl: string | null
    category: string
    enabled: boolean
};

export type ScrapedMenu = ScrapedMenuItem[];
export type Menu = MenuItem[];

export type MenuTable = {
    updateDate: string
    menu: Menu
};

export interface TargetMenuItem extends MenuItem {
    target: string
}
