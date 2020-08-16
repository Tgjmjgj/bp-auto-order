

export type MenuItem = {
    name: string
    price: number
    imageUrl: string | null
    category: string
};

export type Menu = MenuItem[];

export type MenuTable = {
    target: string
    menu: Menu
};
