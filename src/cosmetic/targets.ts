
type TargetPalette = Record<string, {
    primary: string
    secondary: string
}>;

export const targetAvatar: Record<string, string> = {
    'kumir': 'K',
    'namnym': 'H',
    'elunch': 'E',
    'lunchtime': 'L',
    'chanakhi': 'Ч',
};

export const targetPalette: TargetPalette = {
    'kumir': {
        primary: '#7bb21f',
        secondary: '#dacbcb',
    },
    'namnym': {
        primary: '#ffad01',
        secondary: '#dacbcb',
    },
    'elunch': {
        primary: '#f04e45',
        secondary: '#fff',
    },
    'lunchtime': {
        primary: '#63b030',
        secondary: '#fff',
    },
    'chanakhi': {
        primary: '#4a0909',
        secondary: '#fff',
    },
};
