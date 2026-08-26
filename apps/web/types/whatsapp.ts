export interface WhatsAppPurchaseItem {
  productId: string;
  quantity: number;
}

export type WhatsAppErrorCode =
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_UNAVAILABLE'
  | 'INSUFFICIENT_STOCK';

export interface WhatsAppPurchaseErrorBody {
  code: WhatsAppErrorCode;
  message: string;
  productId: string;
  availableStock?: number;
}

export interface WhatsAppPurchaseResponse {
  whatsappUrl: string;
}