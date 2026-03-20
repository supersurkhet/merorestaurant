/**
 * Typed Convex function references for the mobile app.
 *
 * Since the Convex functions live in apps/web/convex/, the mobile app
 * cannot import _generated/api directly. Instead we use makeFunctionReference
 * to create typed references to the same deployed functions.
 *
 * These references work with useQuery() and useMutation() from convex/react.
 */
import { makeFunctionReference } from 'convex/server';
import type { Id } from './convex-types';

// --- Restaurants ---
export const api = {
  restaurants: {
    getBySlug: makeFunctionReference<
      'query',
      { slug: string },
      any | null
    >('restaurants:getBySlug'),
  },

  categories: {
    listByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'> },
      any[]
    >('categories:listByRestaurant'),
  },

  menuItems: {
    listByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'>; availableOnly?: boolean },
      any[]
    >('menuItems:listByRestaurant'),

    listByCategory: makeFunctionReference<
      'query',
      { categoryId: Id<'categories'> },
      any[]
    >('menuItems:listByCategory'),
  },

  tables: {
    getByQrCode: makeFunctionReference<
      'query',
      { qrCode: string },
      any | null
    >('tables:getByQrCode'),

    listByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'> },
      any[]
    >('tables:listByRestaurant'),
  },

  wifi: {
    getActiveByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'> },
      { _id: string; ssid: string; password: string; encryptionType: string; qrString: string } | null
    >('wifi:getActiveByRestaurant'),
  },

  orders: {
    placeOrder: makeFunctionReference<
      'mutation',
      {
        restaurantId: Id<'restaurants'>;
        tableId?: Id<'tables'>;
        items: Array<{
          menuItemId: Id<'menuItems'>;
          quantity: number;
          notes?: string;
        }>;
        customerName?: string;
        customerPhone?: string;
        notes?: string;
      },
      { orderId: string; orderNumber: string }
    >('orders:placeOrder'),

    getByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'>; status?: string },
      any[]
    >('orders:getByRestaurant'),

    getByTable: makeFunctionReference<
      'query',
      { tableId: Id<'tables'> },
      any[]
    >('orders:getByTable'),

    getByOrderNumber: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'>; orderNumber: string },
      any | null
    >('orders:getByOrderNumber'),
  },

  orderItems: {
    getByOrder: makeFunctionReference<
      'query',
      { orderId: Id<'orders'> },
      any[]
    >('orderItems:getByOrder'),
  },

  payments: {
    createPayment: makeFunctionReference<
      'mutation',
      {
        restaurantId: Id<'restaurants'>;
        orderId: Id<'orders'>;
        method: 'cash' | 'khalti' | 'esewa' | 'fonepay';
        amount: number;
        externalRef?: string;
      },
      Id<'payments'>
    >('payments:createPayment'),

    updateStatus: makeFunctionReference<
      'mutation',
      {
        id: Id<'payments'>;
        status: 'pending' | 'completed' | 'failed' | 'refunded';
        externalRef?: string;
      },
      void
    >('payments:updateStatus'),

    getByOrder: makeFunctionReference<
      'query',
      { orderId: Id<'orders'> },
      any[]
    >('payments:getByOrder'),
  },
} as const;
