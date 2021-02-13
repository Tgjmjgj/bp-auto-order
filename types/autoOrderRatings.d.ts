
type MenuItemId = string;
type TargetId = string;
type RatingId = string;
type CommentId = string;
type UserId = string;

export interface Rate {
    total: number
}

export interface UserComment {
    id: CommentId
    userId: UserId
    content: string
    datetime: number
    itemId?: MenuItemId
}

export interface MenuItemRating {
    id: RatingId
    itemId: MenuItemId
    targetId: TargetId
    averageRate: Rate
    comments: UserComment[]
}

export type RatingsData = Record<TargetId, Record<MenuItemId, MenuItemRating>>;
