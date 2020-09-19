
export interface ScrapedMenuItem {
    name: string
    additional: string
    price: number
    imageUrl: string | null
    category: string
}

export interface MenuItem extends ScrapedMenuItem {
    id: string
    targetId: string
}

export interface AnyMenuItem extends MenuItem {
    enabled: boolean
}

export type ScrapedMenu = ScrapedMenuItem[];

export type MenuItemsTable = {
    menuItems: MenuItem[]
};

type DateFrmt = string; // "MM/dd/yyyy"
export type MenuAvailabilityTable = Record<DateFrmt, string[]>; // MenuItems.id[]

export type UpdatedMenu = AnyMenuItem[];
