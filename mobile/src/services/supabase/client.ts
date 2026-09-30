import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_CONFIG } from "../../constants/config";

// CRITICAL SECURITY RULE:
// Only anonymous public key is used in mobile client.
// Service role key is NEVER stored or referenced in mobile code.
const supabaseUrl = process.env.REACT_NATIVE_SUPABASE_URL || APP_CONFIG.supabaseUrl;
const supabaseAnonKey = process.env.REACT_NATIVE_SUPABASE_ANON_KEY || APP_CONFIG.supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
