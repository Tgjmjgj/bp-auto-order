import { OrderItem, OrderTarget } from './autoOrderConfigs';
import { Rate } from './autoOrderRatings';

type OrderItemId = string;
type OrderId = string;
type DatetimeNum = number;

export interface PlaceOrderData {
    spreadsheetId: string
    forDate: string
    items: OrderItem[]
    targets: OrderTarget[]
    systemName?: string
    customName?: string
    overwrite?: boolean
    allowMultiple?: boolean
}

export interface OrderHistoryItem {
    id: OrderId
    datetime: DatetimeNum
    orderData: PlaceOrderData
    row: number
    itemsRates: Record<OrderItemId, Rate>
    orderRate?: Rate
}

export type OrderHistory = Record<DatetimeNum, OrderHistoryItem[]>;
