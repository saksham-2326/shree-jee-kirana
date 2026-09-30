import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { COLORS, SPACING } from "../constants/theme";

interface LoadingSpinnerProps {
  message?: string;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading from Shree Jee Kirana...",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
