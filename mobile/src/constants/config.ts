export const APP_CONFIG = {
  storeName: "Shree Jee Kirana",
  storeTagline: "Aapki Apni Dukaan",
  storeCity: "Nathdwara, Rajasthan",
  supportPhone: "+91 9079192291",
  supportEmail: "support@shreejeekirana.com",

  // Default UPI Merchant Configuration
  defaultUpiVpa: "shreejeekirana@upi",
  defaultUpiName: "Shree Jee Kirana Store",
  defaultUpiMcc: "5411", // Grocery Store MCC

  // Fallback defaults
  minOrderAmount: 99,
  deliveryFee: 30,
  freeDeliveryThreshold: 499,

  // Supabase (Safe anonymous key only, never service role key in mobile)
  supabaseUrl: "https://placeholder.supabase.co",
  supabaseAnonKey: "placeholder-anon-key",
};
