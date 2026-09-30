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
import { AuthStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { authService } from "../../services/supabase/authService";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "ForgotPassword">;
};

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    setError(null);
    setMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid registered email address.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email.trim());
      setMessage(
        "A password reset link has been dispatched to your email address. Please check your inbox."
      );
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your registered email address and we will send you instructions to reset your password.
          </Text>
        </View>

        {message && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ {message}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Input
            label="Registered Email"
            placeholder="e.g. rahul@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Button
            title="Send Reset Instructions"
            onPress={handleReset}
            loading={loading}
            size="lg"
            style={styles.resetBtn}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back to Sign In</Text>
        </TouchableOpacity>
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
    marginBottom: SPACING.xl,
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
    lineHeight: 18,
  },
  successBox: {
    backgroundColor: COLORS.successLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  successText: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "600",
  },
  form: {
    marginBottom: SPACING.xl,
  },
  resetBtn: {
    marginTop: SPACING.xs,
  },
  backButton: {
    alignSelf: "center",
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
