import { supabase } from "./client";
import { Category, Product } from "../../types/models";

export const productService = {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getProducts(categoryId?: string): Promise<Product[]> {
    let query = supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query.order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getDiscountedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .not("discount_price", "is", null)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  async searchProducts(searchTerm: string): Promise<Product[]> {
    if (!searchTerm.trim()) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },
};
