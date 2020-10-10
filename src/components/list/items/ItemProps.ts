
export type Identifiable = {
    id: string
};

export type ItemProps<T extends Identifiable> = {
    item: T
    selected: boolean
    searchText: string
    onClick: (item: T, e: React.MouseEvent<HTMLElement, MouseEvent>) => void
};
