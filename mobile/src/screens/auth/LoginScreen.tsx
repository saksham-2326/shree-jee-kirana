import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp } from "@react-navigation/native";
import { AuthStackParamList, RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { authService } from "../../services/supabase/authService";
import { useAuthStore } from "../../store/authStore";

type LoginScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList, "Login">,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setSession } = useAuthStore();

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.signIn(email.trim(), password);
      if (data?.user) {
        const profile = await authService.getProfile(data.user.id);
        setSession(data.user, profile);
        navigation.replace("MainTabs");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.storeLogoCircle}>
            <Text style={styles.storeEmoji}>🏪</Text>
          </View>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to Shree Jee Kirana to start shopping</Text>
        </View>

        {/* Error Alert */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="e.g. rahul@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Input
            label="Password"
            placeholder="••••••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In to Shop"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.loginBtn}
          />
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to Shree Jee Kirana? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    padding: SPACING.xxl,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  storeLogoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  storeEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error + "40",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "600",
  },
  form: {
    marginBottom: SPACING.xl,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: SPACING.lg,
  },
  forgotText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  loginBtn: {
    marginTop: SPACING.xs,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },
});
