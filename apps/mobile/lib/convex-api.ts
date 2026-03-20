/**
 * Typed Convex function references for the mobile app.
 *
 * Root convex/ functions: restaurants, categories, menuItems, orders, orderItems
 * apps/web/convex/ functions: tables, wifi, payments, staff (not yet in root)
 *
 * We use makeFunctionReference to call these without _generated/api.
 */
import { makeFunctionReference } from 'convex/server';
import type { Id } from './convex-types';

export const api = {
  restaurants: {
    getBySlug: makeFunctionReference<'query', { slug: string }, any | null>(
      'restaurants:getBySlug',
    ),
    get: makeFunctionReference<'query', { id: Id<'restaurants'> }, any | null>(
      'restaurants:get',
    ),
  },

  categories: {
    listByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'> },
      any[]
    >('categories:listByRestaurant'),

    listActiveByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'> },
      any[]
    >('categories:listActiveByRestaurant'),
  },

  menuItems: {
    listByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'>; onlyAvailable?: boolean },
      any[]
    >('menuItems:listByRestaurant'),

    listByCategory: makeFunctionReference<
      'query',
      { categoryId: Id<'categories'> },
      any[]
    >('menuItems:listByCategory'),

    get: makeFunctionReference<'query', { id: Id<'menuItems'> }, any | null>(
      'menuItems:get',
    ),
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
      { orderId: string; orderNumber: string; total: number }
    >('orders:placeOrder'),

    getByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'>; status?: string },
      any[]
    >('orders:getByRestaurant'),

    getActiveByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'> },
      any[]
    >('orders:getActiveByRestaurant'),

    getByTable: makeFunctionReference<
      'query',
      { tableId: Id<'tables'> },
      any[]
    >('orders:getByTable'),

    getByOrderNumber: makeFunctionReference<
      'query',
      { orderNumber: string },
      any | null
    >('orders:getByOrderNumber'),

    get: makeFunctionReference<'query', { id: Id<'orders'> }, any | null>(
      'orders:get',
    ),
  },

  orderItems: {
    getByOrder: makeFunctionReference<
      'query',
      { orderId: Id<'orders'> },
      any[]
    >('orderItems:getByOrder'),
  },

  tables: {
    // Returns { table, restaurant, wifi } — all info needed after QR scan
    getByQrCode: makeFunctionReference<
      'query',
      { qrCode: string },
      { table: any; restaurant: any; wifi: any | null } | null
    >('tables:getByQrCode'),

    listByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'> },
      any[]
    >('tables:listByRestaurant'),

    get: makeFunctionReference<'query', { id: Id<'tables'> }, any | null>(
      'tables:get',
    ),
  },

  wifi: {
    getActiveByRestaurant: makeFunctionReference<
      'query',
      { restaurantId: Id<'restaurants'> },
      any | null
    >('wifiConfigs:getActiveByRestaurant'),
  },

  payments: {
    createPayment: makeFunctionReference<
      'mutation',
      {
        orderId: Id<'orders'>;
        restaurantId: Id<'restaurants'>;
        amount: number;
        method: 'cash' | 'khalti' | 'esewa' | 'fonepay';
      },
      Id<'payments'>
    >('payments:createPayment'),

    updateStatus: makeFunctionReference<
      'mutation',
      {
        id: Id<'payments'>;
        status: 'completed' | 'failed' | 'refunded';
        transactionId?: string;
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
