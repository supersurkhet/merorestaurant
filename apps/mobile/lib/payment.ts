/**
 * Payment gateway integration using @nabwin/paisa.
 * Khalti & eSewa SDK wrappers for React Native.
 *
 * In production, secret keys should come from the server (Convex HTTP endpoint).
 * For development, we use sandbox test credentials.
 */
import { KhaltiClient, type KhaltiInitiateResponse } from '@nabwin/paisa';
import { EsewaClient, type EsewaPaymentFormData } from '@nabwin/paisa';

// Sandbox test credentials — replace with env vars in production
const KHALTI_SECRET = process.env.EXPO_PUBLIC_KHALTI_SECRET ?? 'test_secret_key_placeholder';
const ESEWA_MERCHANT = process.env.EXPO_PUBLIC_ESEWA_MERCHANT ?? 'EPAYTEST';
const ESEWA_SECRET = process.env.EXPO_PUBLIC_ESEWA_SECRET ?? '8gBm/:&EnhH.1/q';

const APP_SCHEME = 'merorestaurant';
const RETURN_URL = `${APP_SCHEME}://payment/callback`;

const khaltiClient = new KhaltiClient({
  secretKey: KHALTI_SECRET,
  environment: 'sandbox',
  returnUrl: RETURN_URL,
  websiteUrl: 'https://restaurant.surkhet.app',
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
  // Fonepay doesn't have a client SDK in @nabwin/paisa yet.
  // In production, generate QR via Convex HTTP endpoint.
  // For now, return a placeholder deep link.
  console.log('[Payment] Generating Fonepay QR:', params);
  return `https://fonepay.com/pay?amount=${params.amount}&ref=${params.orderId}`;
}
