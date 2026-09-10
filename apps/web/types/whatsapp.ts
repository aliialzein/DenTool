export interface WhatsAppPurchaseItem {
  productId: string;
  quantity: number;
  selectedOptionValueIds: string[];
}

export type WhatsAppErrorCode =
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_UNAVAILABLE'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_OPTION';

export interface WhatsAppPurchaseErrorBody {
  code: WhatsAppErrorCode;
  message: string;
  productId: string;
  availableStock?: number;
}

export interface WhatsAppPurchaseResponse {
  whatsappUrl: string;
}