import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';

const api = anyApi;

/**
 * Payment gateway callback handler.
 * Called by Khalti/eSewa/Fonepay after payment is processed.
 */
export const GET: RequestHandler = async ({ url }) => {
	const convexUrl = import.meta.env.VITE_PUBLIC_CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		return json({ error: 'Convex not configured' }, { status: 500 });
	}

	const client = new ConvexHttpClient(convexUrl as string);

	const paymentId = url.searchParams.get('paymentId');
	const status = url.searchParams.get('status');
	const externalRef =
		url.searchParams.get('transaction_id') ||
		url.searchParams.get('refId') ||
		url.searchParams.get('PRN');

	if (!paymentId) {
		return json({ error: 'Missing paymentId' }, { status: 400 });
	}

	try {
		const convexStatus = status === 'Completed' || status === 'success' ? 'completed' : 'failed';

		await client.mutation(api.payments.updateStatus, {
			id: paymentId as any,
			status: convexStatus as any,
			externalRef: externalRef || undefined
		});

		const orderId = url.searchParams.get('orderId') || '';
		return new Response(null, {
			status: 302,
			headers: { Location: `/order/${orderId}?payment=${convexStatus}` }
		});
	} catch (err: any) {
		console.error('Payment callback error:', err);
		return json({ error: err.message || 'Payment verification failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, url }) => {
	const convexUrl = import.meta.env.VITE_PUBLIC_CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		return json({ error: 'Convex not configured' }, { status: 500 });
	}

	const client = new ConvexHttpClient(convexUrl as string);
	const body = await request.json().catch(() => ({})) as Record<string, any>;
	const paymentId = body.paymentId || url.searchParams.get('paymentId');

	if (!paymentId) {
		return json({ error: 'Missing paymentId' }, { status: 400 });
	}

	try {
		const externalRef = body.transaction_id || body.refId;

		await client.mutation(api.payments.updateStatus, {
			id: paymentId as any,
			status: 'completed' as any,
			externalRef: externalRef || undefined
		});

		return json({ success: true });
	} catch (err: any) {
		console.error('Payment callback error:', err);
		return json({ error: err.message }, { status: 500 });
	}
};
