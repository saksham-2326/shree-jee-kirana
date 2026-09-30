import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { OrderStatus } from "../types/models";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
}

interface Step {
  id: OrderStatus;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { id: "pending", label: "Order Placed", description: "Order details received" },
  { id: "confirmed", label: "Confirmed", description: "Payment verified by store" },
  { id: "preparing", label: "Preparing", description: "Picking fresh grocery items" },
  { id: "out_for_delivery", label: "Out for Delivery", description: "Partner on the way" },
  { id: "delivered", label: "Delivered", description: "Handed over at your doorstep" },
];

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
}) => {
  if (currentStatus === "cancelled") {
    return (
      <View style={styles.cancelledBox}>
        <Text style={styles.cancelledTitle}>Order Cancelled</Text>
        <Text style={styles.cancelledText}>
          This order was cancelled. Any items held have been released back to store stock.
        </Text>
      </View>
    );
  }

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return 0;
      case "confirmed":
        return 1;
      case "preparing":
        return 2;
      case "out_for_delivery":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <View key={step.id} style={styles.stepRow}>
            {/* Left Indicator & Connecting Line */}
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isCurrent && styles.circleCurrent,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkMark}>✓</Text>
                ) : (
                  <Text style={styles.circleNumber}>{index + 1}</Text>
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.verticalLine,
                    isCompleted && index < currentIndex && styles.lineCompleted,
                  ]}
                />
              )}
            </View>

            {/* Right Text */}
            <View style={styles.textCol}>
              <Text
                style={[
                  styles.label,
                  isCompleted && styles.labelCompleted,
                  isCurrent && styles.labelCurrent,
                ]}
              >
                {step.label}
              </Text>
              <Text style={styles.description}>{step.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  stepRow: {
    flexDirection: "row",
    minHeight: 52,
  },
  indicatorCol: {
    alignItems: "center",
    width: 32,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  circleCompleted: {
    backgroundColor: COLORS.primary,
  },
  circleCurrent: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  checkMark: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: "bold",
  },
  circleNumber: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "bold",
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: COLORS.primary,
  },
  textCol: {
    flex: 1,
    marginLeft: SPACING.md,
    paddingBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  labelCompleted: {
    color: COLORS.textPrimary,
  },
  labelCurrent: {
    color: COLORS.primaryDark,
    fontWeight: "800",
  },
  description: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cancelledBox: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.error + "40",
  },
  cancelledTitle: {
    color: COLORS.error,
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 4,
  },
  cancelledText: {
    color: "#7F1D1D",
    fontSize: 12,
    lineHeight: 16,
  },
});
