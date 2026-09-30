import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "info",
  style,
  textStyle,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case "success":
        return styles.success;
      case "warning":
        return styles.warning;
      case "error":
        return styles.error;
      case "neutral":
        return styles.neutral;
      default:
        return styles.info;
    }
  };

  const getBadgeTextStyle = () => {
    switch (variant) {
      case "success":
        return styles.successText;
      case "warning":
        return styles.warningText;
      case "error":
        return styles.errorText;
      case "neutral":
        return styles.neutralText;
      default:
        return styles.infoText;
    }
  };

  return (
    <View style={[styles.container, getBadgeStyle(), style]}>
      <Text style={[styles.text, getBadgeTextStyle(), textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs - 1,
    borderRadius: RADIUS.full,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  success: {
    backgroundColor: COLORS.successLight,
  },
  successText: {
    color: "#065F46",
  },
  warning: {
    backgroundColor: COLORS.warningLight,
  },
  warningText: {
    color: "#92400E",
  },
  error: {
    backgroundColor: COLORS.errorLight,
  },
  errorText: {
    color: "#991B1B",
  },
  info: {
    backgroundColor: COLORS.primaryLight,
  },
  infoText: {
    color: COLORS.primaryDark,
  },
  neutral: {
    backgroundColor: COLORS.borderLight,
  },
  neutralText: {
    color: COLORS.textSecondary,
  },
});
