import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// ── Payment webhook ─────────────────────────────────────────────────
// Called by Khalti / eSewa / Fonepay after customer completes payment.
// Each gateway POSTs a JSON body with its own shape; we normalise here.
http.route({
  path: "/api/payments/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      // Normalise across gateways
      const gateway: string = body.gateway ?? "unknown";
      const paymentId: string | undefined =
        body.paymentId ?? body.purchase_order_id;
      const externalRef: string | undefined =
        body.externalRef ?? body.transaction_id ?? body.pidx;
      const status: string | undefined = body.status;

      if (!paymentId) {
        return jsonResponse({ error: "Missing paymentId" }, 400);
      }

      // TODO: In production, verify the callback signature with each
      // gateway's secret key before trusting the payload.
      // - Khalti: verify via /api/v2/payment/verify/ with pidx
      // - eSewa: verify signature with merchant secret
      // - Fonepay: verify HMAC with shared key

      const isSuccess =
        status === "Completed" || // Khalti
        status === "COMPLETE" || // eSewa
        status === "success"; // Fonepay / generic

      await ctx.runMutation(api.payments.updateStatus, {
        id: paymentId as any,
        status: isSuccess ? "completed" : "failed",
        externalRef: externalRef ?? `${gateway}-${Date.now()}`,
      });

      return jsonResponse({ success: true });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Unknown error";
      return jsonResponse({ error: msg }, 500);
    }
  }),
});

// ── Public WiFi endpoint ────────────────────────────────────────────
// GET /api/wifi/:restaurantSlug — no auth, returns WiFi config for QR
http.route({
  path: "/api/wifi",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return jsonResponse(
        { error: "Missing ?slug= query parameter" },
        400,
      );
    }

    // Look up restaurant by slug
    const restaurant = await ctx.runQuery(api.restaurants.getBySlug, {
      slug,
    });
    if (!restaurant) {
      return jsonResponse({ error: "Restaurant not found" }, 404);
    }

    // Get active WiFi config
    const wifi = await ctx.runQuery(api.wifi.getActiveByRestaurant, {
      restaurantId: restaurant._id,
    });
    if (!wifi) {
      return jsonResponse({ error: "No WiFi configured" }, 404);
    }

    return jsonResponse(wifi, 200, {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    });
  }),
});

// ── Helper ──────────────────────────────────────────────────────────
function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export default http;
