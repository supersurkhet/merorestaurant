import { create } from 'zustand';

/**
 * Session store — holds the active restaurant context after QR scan.
 * This is the core of the QR-first multi-tenant flow:
 * No restaurant is selected until the user scans a QR code.
 */
interface SessionStore {
  // Set after QR scan
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantNameNe: string | null;
  tableId: string | null;
  tableLabel: string | null;
  tableNumber: number | null;

  // WiFi credentials from QR/Convex
  wifiSsid: string | null;
  wifiPassword: string | null;

  // Whether the user has an active session (scanned a QR)
  isActive: boolean;

  // Order tracking — IDs of orders placed in this session
  orderIds: string[];

  // Actions
  startSession: (params: {
    restaurantId: string;
    restaurantName: string;
    restaurantNameNe?: string;
    tableId: string;
    tableLabel?: string;
    tableNumber?: number;
    wifiSsid?: string;
    wifiPassword?: string;
  }) => void;
  addOrderId: (orderId: string) => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  restaurantId: null,
  restaurantName: null,
  restaurantNameNe: null,
  tableId: null,
  tableLabel: null,
  tableNumber: null,
  wifiSsid: null,
  wifiPassword: null,
  isActive: false,
  orderIds: [],

  startSession: (params) =>
    set({
      restaurantId: params.restaurantId,
      restaurantName: params.restaurantName,
      restaurantNameNe: params.restaurantNameNe ?? null,
      tableId: params.tableId,
      tableLabel: params.tableLabel ?? null,
      tableNumber: params.tableNumber ?? null,
      wifiSsid: params.wifiSsid ?? null,
      wifiPassword: params.wifiPassword ?? null,
      isActive: true,
      orderIds: [],
    }),

  addOrderId: (orderId) =>
    set((state) => ({ orderIds: [...state.orderIds, orderId] })),

  endSession: () =>
    set({
      restaurantId: null,
      restaurantName: null,
      restaurantNameNe: null,
      tableId: null,
      tableLabel: null,
      tableNumber: null,
      wifiSsid: null,
      wifiPassword: null,
      isActive: false,
      orderIds: [],
    }),
}));
