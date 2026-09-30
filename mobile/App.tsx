import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { supabase } from "./src/services/supabase/client";
import { authService } from "./src/services/supabase/authService";
import { useAuthStore } from "./src/store/authStore";
import { COLORS } from "./src/constants/theme";

export default function App() {
  const { setSession, clearSession } = useAuthStore();

  useEffect(() => {
    // Listen for auth state changes (sign-in, token refresh, sign-out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await authService.getProfile(session.user.id);
          setSession(session.user, profile);
        } catch {
          setSession(session.user, null);
        }
      } else {
        clearSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, clearSession]);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.surface}
        translucent={false}
      />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
