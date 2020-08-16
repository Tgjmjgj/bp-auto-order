

export type KumirMenu = {
    name: string
    price: number
    imageUrl: string
    category: string
}[];

type DateString = string;

export type KumirMenuHistory = Record<DateString, KumirMenu>;
