import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ── Khalti payment verification ─────────────────────────────────────
// Khalti redirects user back with pidx, then we verify server-side.
http.route({
  path: "/api/payments/khalti/verify",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { paymentId, pidx } = body;

      if (!paymentId || !pidx) {
        return jsonResponse(
          { error: "Missing paymentId or pidx" },
          400,
        );
      }

      // Verify with Khalti lookup API
      // In production: POST https://khalti.com/api/v2/epayment/lookup/
      // with { pidx } and Authorization header
      // For now, we trust the callback and mark completed
      const isVerified = true; // TODO: actual Khalti API call

      await ctx.runMutation(api.payments.updateStatus, {
        id: paymentId as any,
        status: isVerified ? "completed" : "failed",
        externalRef: `khalti-${pidx}`,
      });

      return jsonResponse({ success: true, gateway: "khalti", pidx });
    } catch (error) {
      return jsonResponse(
        { error: errorMessage(error) },
        500,
      );
    }
  }),
});

// ── eSewa payment verification ──────────────────────────────────────
// eSewa redirects with encoded transaction data in query params.
http.route({
  path: "/api/payments/esewa/verify",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { paymentId, encodedData } = body;

      if (!paymentId) {
        return jsonResponse({ error: "Missing paymentId" }, 400);
      }

      // Decode eSewa response (base64 encoded JSON)
      // Contains: transaction_code, status, total_amount, transaction_uuid, product_code
      let esewaData: Record<string, unknown> = {};
      if (encodedData) {
        try {
          esewaData = JSON.parse(atob(encodedData));
        } catch {
          return jsonResponse({ error: "Invalid eSewa encoded data" }, 400);
        }
      }

      const transactionCode =
        (esewaData.transaction_code as string) ?? "unknown";
      const status = esewaData.status as string;
      const isSuccess = status === "COMPLETE";

      // TODO: Verify with eSewa transaction status API
      // GET https://esewa.com.np/api/epay/transaction/status/
      // with product_code, total_amount, transaction_uuid

      await ctx.runMutation(api.payments.updateStatus, {
        id: paymentId as any,
        status: isSuccess ? "completed" : "failed",
        externalRef: `esewa-${transactionCode}`,
      });

      return jsonResponse({
        success: isSuccess,
        gateway: "esewa",
        transactionCode,
      });
    } catch (error) {
      return jsonResponse(
        { error: errorMessage(error) },
        500,
      );
    }
  }),
});

// ── Fonepay payment verification ────────────────────────────────────
// Fonepay sends callback with PRPN (Payment Reference Primary Number).
http.route({
  path: "/api/payments/fonepay/verify",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { paymentId, PRN, PRC, BID, UID, DV } = body;

      if (!paymentId || !PRN) {
        return jsonResponse(
          { error: "Missing paymentId or PRN" },
          400,
        );
      }

      // PRC (Payment Response Code): "successful" means success
      const isSuccess = PRC === "successful";

      // TODO: Verify signature using DV (Data Validation) field
      // HMAC-SHA256 of PRN,BID,PRC,UID with shared merchant key

      await ctx.runMutation(api.payments.updateStatus, {
        id: paymentId as any,
        status: isSuccess ? "completed" : "failed",
        externalRef: `fonepay-${PRN}`,
      });

      return jsonResponse({
        success: isSuccess,
        gateway: "fonepay",
        PRN,
      });
    } catch (error) {
      return jsonResponse(
        { error: errorMessage(error) },
        500,
      );
    }
  }),
});

// ── Public WiFi endpoint ────────────────────────────────────────────
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

    const restaurant = await ctx.runQuery(api.restaurants.getBySlug, {
      slug,
    });
    if (!restaurant) {
      return jsonResponse({ error: "Restaurant not found" }, 404);
    }

    const wifi = await ctx.runQuery(api.wifi.getByRestaurant, {
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

// ── Helpers ─────────────────────────────────────────────────────────
function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export default http;
