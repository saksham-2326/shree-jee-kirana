import { create } from "zustand";
import { Product, CartItem } from "../types/models";
import { APP_CONFIG } from "../constants/config";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => { success: boolean; message?: string };
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscountSavings: () => number;
  getDeliveryFee: (threshold?: number, fee?: number) => number;
  getFinalTotal: (threshold?: number, fee?: number) => number;
  validateCartStock: (latestProducts: Product[]) => { isValid: boolean; issues: string[] };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product: Product, quantity = 1) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const existingItem = currentItems[existingIndex];
      const newQty = existingItem.quantity + quantity;

      if (newQty > product.stock_quantity) {
        return {
          success: false,
          message: `Only ${product.stock_quantity} units available in store stock.`,
        };
      }

      const updated = [...currentItems];
      updated[existingIndex] = { ...existingItem, quantity: newQty };
      set({ items: updated });
      return { success: true };
    } else {
      if (quantity > product.stock_quantity) {
        return {
          success: false,
          message: `Only ${product.stock_quantity} units available in store stock.`,
        };
      }

      set({
        items: [...currentItems, { id: product.id, product, quantity }],
      });
      return { success: true };
    }
  },

  removeItem: (productId: string) => {
    set({
      items: get().items.filter((item) => item.product.id !== productId),
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return { success: true };
    }

    const currentItems = get().items;
    const target = currentItems.find((item) => item.product.id === productId);

    if (!target) return { success: false, message: "Item not in cart" };

    if (quantity > target.product.stock_quantity) {
      return {
        success: false,
        message: `Only ${target.product.stock_quantity} units available in stock.`,
      };
    }

    set({
      items: currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
    return { success: true };
  },

  clearCart: () => {
    set({ items: [] });
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const price = item.product.discount_price ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);
  },

  getDiscountSavings: () => {
    return get().items.reduce((sum, item) => {
      if (item.product.discount_price) {
        const diff = item.product.price - item.product.discount_price;
        return sum + diff * item.quantity;
      }
      return sum;
    }, 0);
  },

  getDeliveryFee: (
    threshold = APP_CONFIG.freeDeliveryThreshold,
    fee = APP_CONFIG.deliveryFee
  ) => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= threshold ? 0 : fee;
  },

  getFinalTotal: (
    threshold = APP_CONFIG.freeDeliveryThreshold,
    fee = APP_CONFIG.deliveryFee
  ) => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    const delivery = get().getDeliveryFee(threshold, fee);
    return subtotal + delivery;
  },

  validateCartStock: (latestProducts: Product[]) => {
    const issues: string[] = [];
    const items = get().items;

    for (const item of items) {
      const latest = latestProducts.find((p) => p.id === item.product.id);
      if (!latest || !latest.is_active) {
        issues.push(`"${item.product.name}" is no longer available.`);
      } else if (item.quantity > latest.stock_quantity) {
        issues.push(
          `"${item.product.name}" stock reduced. Only ${latest.stock_quantity} available.`
        );
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  },
}));
