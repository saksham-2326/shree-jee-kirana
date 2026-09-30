import { supabase } from "./client";
import { NotificationItem, StoreSettings } from "../../types/models";
import { APP_CONFIG } from "../../constants/config";

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) throw error;
  },

  async updateFcmToken(token: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ fcm_token: token })
      .eq("id", user.id);
  },
};

export const storeService = {
  async getStoreSettings(): Promise<StoreSettings> {
    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .limit(1)
        .single();

      if (error || !data) {
        // Return default fallback settings
        return {
          id: "default",
          store_name: APP_CONFIG.storeName,
          store_phone: APP_CONFIG.supportPhone,
          store_address: "Lal Bagh, Kothariya Road, Nathdwara, Pincode 313301",
          upi_vpa: APP_CONFIG.defaultUpiVpa,
          upi_merchant_name: APP_CONFIG.defaultUpiName,
          cod_enabled: true,
          pay_at_store_enabled: true,
          min_order_amount: APP_CONFIG.minOrderAmount,
          delivery_fee: APP_CONFIG.deliveryFee,
          free_delivery_threshold: APP_CONFIG.freeDeliveryThreshold,
          is_store_open: true,
          updated_at: new Date().toISOString(),
        };
      }
      return data;
    } catch {
      return {
        id: "default",
        store_name: APP_CONFIG.storeName,
        store_phone: APP_CONFIG.supportPhone,
        store_address: "Lal Bagh, Kothariya Road, Nathdwara, Pincode 313301",
        upi_vpa: APP_CONFIG.defaultUpiVpa,
        upi_merchant_name: APP_CONFIG.defaultUpiName,
        cod_enabled: true,
        pay_at_store_enabled: true,
        min_order_amount: APP_CONFIG.minOrderAmount,
        delivery_fee: APP_CONFIG.deliveryFee,
        free_delivery_threshold: APP_CONFIG.freeDeliveryThreshold,
        is_store_open: true,
        updated_at: new Date().toISOString(),
      };
    }
  },
};
