import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY ?? "";
const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE ?? "";

// ── Khalti payment verification ─────────────────────────────────────
http.route({
  path: "/api/payments/khalti/verify",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { paymentId, pidx } = body;

      if (!paymentId || !pidx) {
        return jsonResponse({ error: "Missing paymentId or pidx" }, 400);
      }

      // Verify with Khalti lookup API
      const khaltiRes = await fetch(
        "https://khalti.com/api/v2/epayment/lookup/",
        {
          method: "POST",
          headers: {
            Authorization: `Key ${KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pidx }),
        }
      );
      const khaltiData = await khaltiRes.json();
      const isVerified =
        khaltiRes.ok && khaltiData.status === "Completed";

      await ctx.runMutation(api.payments.updateStatus, {
        id: paymentId as any,
        status: isVerified ? "completed" : "failed",
        transactionId: `khalti-${pidx}`,
      });

      return jsonResponse({ success: isVerified, gateway: "khalti", pidx });
    } catch (error) {
      return jsonResponse({ error: errorMessage(error) }, 500);
    }
  }),
});

// ── eSewa payment verification ──────────────────────────────────────
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
      const transactionUuid =
        (esewaData.transaction_uuid as string) ?? "";
      const totalAmount = (esewaData.total_amount as number) ?? 0;

      // Verify with eSewa transaction status API
      const esewaRes = await fetch(
        `https://esewa.com.np/api/epay/transaction/status/?product_code=${ESEWA_MERCHANT_CODE}&total_amount=${totalAmount}&transaction_uuid=${transactionUuid}`,
        { method: "GET" }
      );
      const esewaStatus = await esewaRes.json();
      const isSuccess =
        esewaRes.ok && esewaStatus.status === "COMPLETE";

      await ctx.runMutation(api.payments.updateStatus, {
        id: paymentId as any,
        status: isSuccess ? "completed" : "failed",
        transactionId: `esewa-${transactionCode}`,
      });

      return jsonResponse({
        success: isSuccess,
        gateway: "esewa",
        transactionCode,
      });
    } catch (error) {
      return jsonResponse({ error: errorMessage(error) }, 500);
    }
  }),
});

// ── Fonepay payment verification ────────────────────────────────────
http.route({
  path: "/api/payments/fonepay/verify",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { paymentId, PRN, PRC, BID, UID, DV } = body;

      if (!paymentId || !PRN) {
        return jsonResponse({ error: "Missing paymentId or PRN" }, 400);
      }

      // PRC (Payment Response Code): "successful" means success
      // Verify HMAC-SHA256 signature of PRN,BID,PRC,UID with merchant key
      const isSuccess = PRC === "successful";

      if (isSuccess && DV) {
        // Signature verification: in production, compute HMAC-SHA256
        // of `PRN,BID,PRC,UID` with FONEPAY_SECRET_KEY and compare to DV
        const FONEPAY_SECRET = process.env.FONEPAY_SECRET_KEY ?? "";
        if (FONEPAY_SECRET) {
          const encoder = new TextEncoder();
          const keyData = encoder.encode(FONEPAY_SECRET);
          const msgData = encoder.encode(`${PRN},${BID},${PRC},${UID}`);
          const key = await crypto.subtle.importKey(
            "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
          );
          const sig = await crypto.subtle.sign("HMAC", key, msgData);
          const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
          if (computed !== DV) {
            return jsonResponse({ error: "Invalid signature" }, 403);
          }
        }
      }

      await ctx.runMutation(api.payments.updateStatus, {
        id: paymentId as any,
        status: isSuccess ? "completed" : "failed",
        transactionId: `fonepay-${PRN}`,
      });

      return jsonResponse({ success: isSuccess, gateway: "fonepay", PRN });
    } catch (error) {
      return jsonResponse({ error: errorMessage(error) }, 500);
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
      return jsonResponse({ error: "Missing ?slug= query parameter" }, 400);
    }

    const restaurant = await ctx.runQuery(api.restaurants.getBySlug, { slug });
    if (!restaurant) {
      return jsonResponse({ error: "Restaurant not found" }, 404);
    }

    const wifi = await ctx.runQuery(api.wifiConfigs.getActiveByRestaurant, {
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
