
type TargetPalette = Record<string, {
    primary: string
    secondary: string
}>;

export const targetAvatar: Record<string, string> = {
    'kumir': 'K',
    'namnym': 'H',
    'elunch': 'E',
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
};
