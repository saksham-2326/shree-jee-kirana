import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { APP_CONFIG } from "../../constants/config";
import { formatCurrency } from "../../utils/formatters";
import { Order } from "../../types/models";
import { orderService } from "../../services/supabase/orderService";
import { OrderStatusTimeline } from "../../components/OrderStatusTimeline";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Button } from "../../components/Button";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "OrderTracking">;
  route: RouteProp<RootStackParamList, "OrderTracking">;
};

export const OrderTrackingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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

    // Auto refresh status every 15s while screen is active
    const interval = setInterval(loadOrder, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleCallStore = () => {
    Linking.openURL(`tel:${APP_CONFIG.supportPhone}`);
  };

  if (loading) {
    return <LoadingSpinner message="Checking delivery status..." />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tracking Order</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>Order not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const addr = order.delivery_address_snapshot;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("MainTabs")}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.order_number}</Text>
        <TouchableOpacity onPress={loadOrder} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Estimated Status Banner */}
        <View style={styles.deliveryCard}>
          <Text style={styles.deliveryEmoji}>
            {order.order_status === "delivered"
              ? "🎉"
              : order.order_status === "out_for_delivery"
              ? "🛵"
              : order.order_status === "preparing"
              ? "📦"
              : "⏳"}
          </Text>

          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryStatusHeading}>
              {order.order_status === "delivered"
                ? "Order Delivered!"
                : order.order_status === "out_for_delivery"
                ? "Out For Delivery"
                : order.order_status === "preparing"
                ? "Preparing Your Groceries"
                : "Order Confirmed"}
            </Text>
            <Text style={styles.deliveryStatusSub}>
              {order.order_status === "delivered"
                ? "Delivered at your doorstep. Thank you for shopping with Shree Jee Kirana!"
                : order.order_status === "out_for_delivery"
                ? "Our delivery partner is on the way to your address."
                : order.order_status === "preparing"
                ? "Store staff is hand-picking and packaging your grocery items."
                : "Your order details have been received and confirmed by the store."}
            </Text>
          </View>
        </View>

        {/* 5-Step Order Progress Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live Fulfillment Progress</Text>
          <OrderStatusTimeline currentStatus={order.order_status} />
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Delivering To</Text>
          <Text style={styles.addrName}>{addr?.full_name}</Text>
          <Text style={styles.addrPhone}>📞 {addr?.phone}</Text>
          <Text style={styles.addrText}>
            {addr?.house_building}, {addr?.street_area}
            {addr?.landmark ? `, Near ${addr.landmark}` : ""}
          </Text>
          <Text style={styles.addrCity}>
            {addr?.city}, {addr?.state} - {addr?.pincode}
          </Text>
        </View>

        {/* Store Helpline Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏪 Store Support</Text>
          <Text style={styles.storeHelpText}>
            Have questions about your order or want to add items? Contact Shree Jee Kirana directly:
          </Text>

          <Button
            title="Call Store Helpline (Nathdwara)"
            variant="outline"
            onPress={handleCallStore}
            style={styles.callStoreBtn}
          />
        </View>
      </ScrollView>

      {/* View Full Receipt Button */}
      <View style={styles.bottomBar}>
        <Button
          title="View Full Bill & Items Receipt"
          variant="primary"
          onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
          style={styles.receiptBtn}
        />
      </View>
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
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  refreshBtn: {
    padding: SPACING.xs,
  },
  refreshIcon: {
    fontSize: 16,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 90,
    gap: SPACING.md,
  },
  deliveryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  deliveryEmoji: {
    fontSize: 42,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryStatusHeading: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primaryDark,
  },
  deliveryStatusSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
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
    marginBottom: SPACING.sm,
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
    lineHeight: 16,
  },
  addrCity: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  storeHelpText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  callStoreBtn: {
    width: "100%",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  receiptBtn: {
    width: "100%",
  },
  errorText: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginVertical: SPACING.xl,
  },
});
