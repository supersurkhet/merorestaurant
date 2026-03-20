/**
 * Payment gateway integration using @nabwin/paisa.
 * Khalti & eSewa SDK wrappers for React Native.
 *
 * In production, secret keys should come from the server (Convex HTTP endpoint).
 * For development, we use sandbox test credentials.
 */
import { KhaltiClient, type KhaltiInitiateResponse } from '@nabwin/paisa';
import { EsewaClient, type EsewaPaymentFormData } from '@nabwin/paisa';

// Credentials from environment — sandbox defaults for development
const KHALTI_SECRET = process.env.EXPO_PUBLIC_KHALTI_SECRET ?? '';
const ESEWA_MERCHANT = process.env.EXPO_PUBLIC_ESEWA_MERCHANT ?? 'EPAYTEST';
const ESEWA_SECRET = process.env.EXPO_PUBLIC_ESEWA_SECRET ?? '8gBm/:&EnhH.1/q';

const APP_SCHEME = 'merorestaurant';
const RETURN_URL = `${APP_SCHEME}://payment/callback`;

const khaltiClient = new KhaltiClient({
  secretKey: KHALTI_SECRET,
  environment: 'sandbox',
  returnUrl: RETURN_URL,
  websiteUrl: process.env.EXPO_PUBLIC_APP_URL ?? 'https://merorestaurant.app',
});

const esewaClient = new EsewaClient({
  merchantCode: ESEWA_MERCHANT,
  secretKey: ESEWA_SECRET,
  environment: 'sandbox',
  successUrl: `${RETURN_URL}?provider=esewa&status=success`,
  failureUrl: `${RETURN_URL}?provider=esewa&status=failure`,
});

export async function initiateKhaltiPayment(params: {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName?: string;
}): Promise<KhaltiInitiateResponse> {
  console.log('[Payment] Initiating Khalti payment:', params);
  const response = await khaltiClient.initiatePayment({
    amount: params.amount,
    purchaseOrderId: params.orderId,
    purchaseOrderName: `Mero Restaurant - ${params.orderNumber}`,
    customer: params.customerName
      ? { name: params.customerName, email: '', phone: '' }
      : undefined,
  });
  console.log('[Payment] Khalti response:', { pidx: response.pidx, paymentUrl: response.paymentUrl });
  return response;
}

export async function initiateEsewaPayment(params: {
  orderId: string;
  amount: number;
  taxAmount?: number;
}): Promise<EsewaPaymentFormData> {
  console.log('[Payment] Initiating eSewa payment:', params);
  const formData = esewaClient.getPaymentFormData({
    amount: params.amount,
    taxAmount: params.taxAmount ?? 0,
    transactionId: params.orderId,
  });
  console.log('[Payment] eSewa form data:', { actionUrl: formData.actionUrl });
  return formData;
}

export function getFonepayQrUrl(params: {
  amount: number;
  orderId: string;
}): string {
  // Fonepay QR is generated server-side via Convex HTTP endpoint.
  // The merchant portal provides the QR generation API.
  console.log('[Payment] Generating Fonepay QR:', params);
  const baseUrl = process.env.EXPO_PUBLIC_CONVEX_URL?.replace('.convex.cloud', '.convex.site') ?? '';
  return `${baseUrl}/api/fonepay/qr?amount=${params.amount}&ref=${params.orderId}`;
}
