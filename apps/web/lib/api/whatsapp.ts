import type {
    WhatsAppErrorCode,
  WhatsAppPurchaseErrorBody,
  WhatsAppPurchaseItem,
  WhatsAppPurchaseResponse,
} from '../../types/whatsapp';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not configured');
}

export class WhatsAppPurchaseError extends Error {
  code?: WhatsAppErrorCode | string;
  productId?: string;
  availableStock?: number;

  constructor(body: Partial<WhatsAppPurchaseErrorBody>, status: number) {
    super(body.message ?? `Request failed with status ${status}`);
    this.name = 'WhatsAppPurchaseError';
    this.code = body.code;
    this.productId = body.productId;
    this.availableStock = body.availableStock;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: Partial<WhatsAppPurchaseErrorBody> = {};

    try {
      body = (await response.json()) as Partial<WhatsAppPurchaseErrorBody>;
    } catch {
      /* non-JSON error response */
    }

    console.error('API request failed:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      body,
    });

    throw new WhatsAppPurchaseError(body, response.status);
  }

  return response.json() as Promise<T>;
}

export async function createWhatsAppPurchaseRequest(
  items: WhatsAppPurchaseItem[],
): Promise<WhatsAppPurchaseResponse> {
  const response = await fetch(`${API_URL}/whatsapp/purchase-request`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ items }),
  });

  return handleResponse<WhatsAppPurchaseResponse>(response);
}