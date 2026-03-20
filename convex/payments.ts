import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "./_helpers";
import { api } from "./_generated/api";

export const createPayment = mutation({
  args: {
    orderId: v.id("orders"),
    restaurantId: v.id("restaurants"),
    amount: v.number(),
    method: v.union(
      v.literal("cash"),
      v.literal("khalti"),
      v.literal("esewa"),
      v.literal("fonepay")
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    // Check for existing completed payment
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .first();
    if (existing) throw new Error("Order already has a completed payment");

    return await ctx.db.insert("payments", {
      ...args,
      status: "pending",
      paidAt: undefined,
    });
  },
});

export const getByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("payments"),
    status: v.union(
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, transactionId }) => {
    const payment = await ctx.db.get(id);
    if (!payment) throw new Error("Payment not found");

    // Only owner/manager/cashier can manually update payment status
    await requireRole(ctx, payment.restaurantId as string, [
      "owner",
      "manager",
      "cashier",
    ]);

    const updates: Record<string, unknown> = { status };
    if (transactionId) updates.transactionId = transactionId;
    if (status === "completed") {
      updates.paidAt = Date.now();
      // Also update the order to served if it's ready
      const order = await ctx.db.get(payment.orderId);
      if (order && order.status === "ready") {
        await ctx.db.patch(payment.orderId, {
          status: "served" as const,
          servedAt: Date.now(),
        });
        // Free the table
        if (order.tableId) {
          await ctx.db.patch(order.tableId, {
            status: "available" as const,
          });
        }
      }
    }
    await ctx.db.patch(id, updates);
  },
});

export const listByRestaurant = query({
  args: {
    restaurantId: v.id("restaurants"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("refunded")
      )
    ),
  },
  handler: async (ctx, { restaurantId, status }) => {
    await requireAuth(ctx);
    if (status) {
      return await ctx.db
        .query("payments")
        .withIndex("by_restaurant_status", (q) =>
          q.eq("restaurantId", restaurantId).eq("status", status)
        )
        .collect();
    }
    return await ctx.db
      .query("payments")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();
  },
});

// ── Khalti payment verification (real API call) ─────────────────────
export const verifyKhalti = action({
  args: {
    paymentId: v.id("payments"),
    pidx: v.string(),
  },
  handler: async (ctx, { paymentId, pidx }) => {
    const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
    if (!KHALTI_SECRET_KEY) {
      throw new Error("KHALTI_SECRET_KEY environment variable not set");
    }

    // Call the real Khalti lookup API
    const response = await fetch(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Mark payment as failed
      await ctx.runMutation(api.payments.updateStatus, {
        id: paymentId,
        status: "failed",
        transactionId: `khalti-${pidx}-error`,
      });
      throw new Error(`Khalti verification failed: ${response.status} ${errorText}`);
    }

    const khaltiData = await response.json();
    const isVerified = khaltiData.status === "Completed";

    // Update payment status based on Khalti's response
    await ctx.runMutation(api.payments.updateStatus, {
      id: paymentId,
      status: isVerified ? "completed" : "failed",
      transactionId: `khalti-${pidx}`,
    });

    return {
      success: isVerified,
      khaltiStatus: khaltiData.status,
      amount: khaltiData.total_amount,
      pidx,
    };
  },
});
