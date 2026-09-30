import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { Order } from "../../types/models";
import { orderService } from "../../services/supabase/orderService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "OrderDetail">;
  route: RouteProp<RootStackParamList, "OrderDetail">;
};

export const OrderDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = async () => {
    try {
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        { text: "No, Keep Order", style: "cancel" },
        {
          text: "Yes, Cancel Order",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await orderService.cancelOrder(orderId);
              loadOrder();
            } catch (e: any) {
              Alert.alert("Cancellation Failed", e.message || "Failed to cancel order.");
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner message="Fetching order receipt..." />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Not Found</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Could not load the requested order details.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const addr = order.delivery_address_snapshot;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.order_number}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status & Tracking Banner */}
        <View style={styles.statusBanner}>
          <View>
            <Text style={styles.statusLabel}>Current Status</Text>
            <Text style={styles.statusVal}>{order.order_status.replace(/_/g, " ").toUpperCase()}</Text>
            <Text style={styles.placedTime}>Placed on {formatDateTime(order.created_at)}</Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("OrderTracking", { orderId: order.id })}
            style={styles.trackActionBtn}
          >
            <Text style={styles.trackActionText}>Live Track 🛵</Text>
          </TouchableOpacity>
        </View>

        {/* Ordered Items List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered ({order.order_items?.length || 0})</Text>
          <View style={styles.itemsList}>
            {order.order_items?.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  <Text style={styles.itemUnit}>
                    {item.quantity} x {formatCurrency(item.unit_price)} ({item.unit})
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatCurrency(item.total_item_price)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment & Audit Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Mode</Text>
            <Text style={styles.infoValue}>{order.payment_method.toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Status</Text>
            <Badge
              label={order.payment_status}
              variant={order.payment_status === "paid" ? "success" : "warning"}
            />
          </View>
          {order.upi_transaction_ref ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>UPI Reference</Text>
              <Text style={styles.infoValueFontMono}>{order.upi_transaction_ref}</Text>
            </View>
          ) : null}
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          <Text style={styles.addrName}>{addr?.full_name}</Text>
          <Text style={styles.addrPhone}>📞 {addr?.phone}</Text>
          <Text style={styles.addrText}>
            {addr?.house_building}, {addr?.street_area}
            {addr?.landmark ? `, Near ${addr.landmark}` : ""}
          </Text>
          <Text style={styles.addrCity}>
            {addr?.city}, {addr?.state} - {addr?.pincode}
          </Text>
          {addr?.delivery_instructions ? (
            <Text style={styles.addrNotes}>Instructions: {addr.delivery_instructions}</Text>
          ) : null}
        </View>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Breakdown</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Items Subtotal</Text>
            <Text style={styles.infoValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          {order.discount_amount > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.savingsLabel}>Discount Savings</Text>
              <Text style={styles.savingsVal}>-{formatCurrency(order.discount_amount)}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery Fee</Text>
            <Text style={styles.infoValue}>
              {order.delivery_fee === 0 ? "FREE" : formatCurrency(order.delivery_fee)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid / Payable</Text>
            <Text style={styles.totalVal}>{formatCurrency(order.total_amount)}</Text>
          </View>
        </View>

        {/* Cancel Button if pending */}
        {order.order_status === "pending" && (
          <Button
            title="Cancel Order"
            variant="danger"
            onPress={handleCancelOrder}
            loading={cancelling}
            style={styles.cancelBtn}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    height: 52,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backArrow: {
    fontSize: 22,
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 40,
    gap: SPACING.md,
  },
  emptyContainer: {
    padding: SPACING.xxl,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.textMuted,
  },
  statusBanner: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryDark,
    textTransform: "uppercase",
  },
  statusVal: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  placedTime: {
    fontSize: 11,
    color: COLORS.primaryDark + "90",
    marginTop: 2,
  },
  trackActionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  trackActionText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: "800",
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  itemUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  infoValueFontMono: {
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  addrName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  addrPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  addrText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  addrCity: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  addrNotes: {
    fontSize: 11,
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    padding: 6,
    borderRadius: RADIUS.sm,
    marginTop: 6,
  },
  savingsLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  savingsVal: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  cancelBtn: {
    marginTop: SPACING.sm,
  },
});
