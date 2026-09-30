import { supabase } from "./client";
import { Address } from "../../types/models";
import { AddressFormValues } from "../../utils/validation";

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addAddress(
    values: AddressFormValues,
    coordinates?: { latitude?: number; longitude?: number }
  ): Promise<Address> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    if (values.isDefault) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        full_name: values.fullName,
        phone: values.phone,
        house_building: values.houseBuilding,
        street_area: values.streetArea,
        landmark: values.landmark || null,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null,
        is_default: values.isDefault,
        delivery_instructions: values.deliveryInstructions || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAddress(
    id: string,
    values: AddressFormValues,
    coordinates?: { latitude?: number; longitude?: number }
  ): Promise<Address> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    if (values.isDefault) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { data, error } = await supabase
      .from("addresses")
      .update({
        full_name: values.fullName,
        phone: values.phone,
        house_building: values.houseBuilding,
        street_area: values.streetArea,
        landmark: values.landmark || null,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null,
        is_default: values.isDefault,
        delivery_instructions: values.deliveryInstructions || null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAddress(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
  },

  async setDefaultAddress(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
  },
};
