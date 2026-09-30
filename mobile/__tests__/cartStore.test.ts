import { useCartStore } from "../src/store/cartStore";
import { Product } from "../src/types/models";

const mockProductA: Product = {
  id: "prod-1",
  category_id: "cat-1",
  name: "Aashirvaad Whole Wheat Atta",
  description: "Pure chakki atta",
  brand: "Aashirvaad",
  price: 250,
  discount_price: 220,
  discount_percent: 12,
  unit: "5 kg",
  weight_quantity: "5 kg",
  stock_quantity: 10,
  images: ["https://example.com/atta.jpg"],
  is_active: true,
  is_featured: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockProductB: Product = {
  id: "prod-2",
  category_id: "cat-1",
  name: "Tata Salt",
  description: "Vacuum evaporated salt",
  brand: "Tata Salt",
  price: 28,
  discount_price: null,
  discount_percent: 0,
  unit: "1 kg",
  weight_quantity: "1 kg",
  stock_quantity: 3,
  images: ["https://example.com/salt.jpg"],
  is_active: true,
  is_featured: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("CartStore - Calculations & Stock Protection", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  test("calculates subtotal and discount savings accurately", () => {
    const store = useCartStore.getState();

    // Add 2x Atta (effective 220 each) and 1x Salt (28 each)
    store.addItem(mockProductA, 2);
    store.addItem(mockProductB, 1);

    expect(useCartStore.getState().getItemCount()).toBe(3);
    // Subtotal = 2 * 220 + 1 * 28 = 440 + 28 = 468
    expect(useCartStore.getState().getSubtotal()).toBe(468);
    // Discount savings = 2 * (250 - 220) = 60
    expect(useCartStore.getState().getDiscountSavings()).toBe(60);
  });

  test("enforces delivery fee threshold rules correctly", () => {
    const store = useCartStore.getState();

    // 1x Salt = ₹28 (below threshold of 499, delivery fee 30 applies)
    store.addItem(mockProductB, 1);
    expect(useCartStore.getState().getDeliveryFee(499, 30)).toBe(30);
    expect(useCartStore.getState().getFinalTotal(499, 30)).toBe(58);

    // Add 2x Atta: Subtotal becomes 468 + 220 = 688 (>= 499, FREE delivery applies)
    store.addItem(mockProductA, 3);
    expect(useCartStore.getState().getDeliveryFee(499, 30)).toBe(0);
    expect(useCartStore.getState().getFinalTotal(499, 30)).toBe(useCartStore.getState().getSubtotal());
  });

  test("prevents adding more items than available store stock", () => {
    const store = useCartStore.getState();

    // Product B only has stock_quantity: 3
    const res1 = store.addItem(mockProductB, 3);
    expect(res1.success).toBe(true);

    // Attempting to add 1 more exceeds available stock
    const res2 = store.addItem(mockProductB, 1);
    expect(res2.success).toBe(false);
    expect(res2.message).toContain("available in store stock");
  });

  test("updates quantity and handles zero item removal safely", () => {
    const store = useCartStore.getState();
    store.addItem(mockProductA, 2);

    // Update quantity to 1
    store.updateQuantity(mockProductA.id, 1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);

    // Updating to 0 removes the item from cart
    store.updateQuantity(mockProductA.id, 0);
    expect(useCartStore.getState().items.length).toBe(0);
  });
});
