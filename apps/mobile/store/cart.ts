import { create } from 'zustand';

export interface CartItem {
  menuItemId: string;
  name: string;
  nameNe?: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  tableId: string | null;
  restaurantId: string | null;
  setTable: (tableId: string, restaurantId: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateInstructions: (menuItemId: string, instructions: string) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  tableId: null,
  restaurantId: null,

  setTable: (tableId, restaurantId) => set({ tableId, restaurantId }),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menuItemId === item.menuItemId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),

  removeItem: (menuItemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.menuItemId !== menuItemId),
    })),

  updateQuantity: (menuItemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.menuItemId !== menuItemId) };
      }
      return {
        items: state.items.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i
        ),
      };
    }),

  updateInstructions: (menuItemId, instructions) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, specialInstructions: instructions } : i
      ),
    })),

  clearCart: () => set({ items: [], tableId: null, restaurantId: null }),

  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
