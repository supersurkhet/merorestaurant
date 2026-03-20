import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Payment verification webhook endpoint
// Called by payment gateways (eSewa, Khalti, Fonepay) after payment
http.route({
  path: "/api/payments/verify",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { paymentId, externalRef, gateway } = body;

    if (!paymentId) {
      return new Response(JSON.stringify({ error: "Missing paymentId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // In production, verify with the actual gateway API here
      // For now, mark as completed with the external reference
      await ctx.runMutation(api.payments.complete, {
        id: paymentId,
        externalRef: externalRef ?? `${gateway}-${Date.now()}`,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }),
});

// Public WiFi config endpoint (for QR code generators)
http.route({
  path: "/api/wifi",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const restaurantId = url.searchParams.get("restaurantId");

    if (!restaurantId) {
      return new Response(
        JSON.stringify({ error: "Missing restaurantId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const wifi = await ctx.runQuery(api.wifi.getActive, {
      restaurantId: restaurantId as any,
    });

    if (!wifi) {
      return new Response(JSON.stringify({ error: "No WiFi configured" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return WiFi string for QR code: WIFI:T:WPA;S:mynetwork;P:mypass;;
    const wifiString = `WIFI:T:${wifi.encryptionType};S:${wifi.ssid};P:${wifi.password};;`;

    return new Response(
      JSON.stringify({ ...wifi, qrString: wifiString }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }),
});

export default http;
