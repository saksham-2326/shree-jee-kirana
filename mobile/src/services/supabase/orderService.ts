import { supabase } from "./client";
import { Order, PaymentMethod } from "../../types/models";

export interface CreateOrderParams {
  addressId: string;
  items: { product_id: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  notes?: string;
}

export const orderService = {
  /**
   * Creates a verified order on the backend.
   * Server calculates item prices, checks current inventory, and creates order records.
   */
  async createVerifiedOrder(params: CreateOrderParams) {
    const { data, error } = await supabase.rpc("create_verified_order", {
      p_address_id: params.addressId,
      p_items: params.items,
      p_payment_method: params.paymentMethod,
      p_notes: params.notes || null,
    });

    if (error) throw error;
    return data;
  },

  async getOrders(): Promise<Order[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return data;
  },

  async cancelOrder(orderId: string) {
    const { data, error } = await supabase
      .from("orders")
      .update({ order_status: "cancelled" })
      .eq("id", orderId)
      .eq("order_status", "pending")
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
