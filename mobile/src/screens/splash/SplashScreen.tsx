import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, SPACING } from "../../constants/theme";
import { authService } from "../../services/supabase/authService";
import { useAuthStore } from "../../store/authStore";

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Splash">;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const { setSession } = useAuthStore();

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Check existing session & navigate
    const timer = setTimeout(async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session?.user) {
          const profile = await authService.getProfile(session.user.id);
          setSession(session.user, profile);
          navigation.replace("MainTabs");
        } else {
          navigation.replace("Onboarding");
        }
      } catch {
        navigation.replace("Onboarding");
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, setSession]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.storeEmoji}>🏪</Text>
        </View>
        <Text style={styles.storeName}>Shree Jee Kirana</Text>
        <View style={styles.taglineBadge}>
          <Text style={styles.tagline}>Aapki Apni Dukaan</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.subtext}>Daily Groceries & Essentials • Instant UPI</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDeep,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  logoContainer: {
    alignItems: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.secondary,
  },
  storeEmoji: {
    fontSize: 48,
  },
  storeName: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textWhite,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  taglineBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: SPACING.sm,
  },
  tagline: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 40,
  },
  subtext: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
