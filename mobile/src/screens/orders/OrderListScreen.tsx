import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList, RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { Order } from "../../types/models";
import { orderService } from "../../services/supabase/orderService";
import { useAuthStore } from "../../store/authStore";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { Badge } from "../../components/Badge";

type OrderListNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "OrdersTab">,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: OrderListNavigationProp;
};

export const OrderListScreen: React.FC<Props> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { isAuthenticated } = useAuthStore();

  const loadOrders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <EmptyState
          title="Sign in to View Orders"
          description="Log in to track your current grocery delivery or review previous purchases."
          icon="📦"
          actionLabel="Sign In"
          onAction={() => navigation.navigate("Auth")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSub}>{orders.length} orders placed</Text>
      </View>

      {loading ? (
        <LoadingSpinner message="Fetching your grocery orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Orders Yet"
          description="You haven't placed any grocery orders yet. Start shopping fresh flour, pulses, spices, and snacks!"
          icon="🛍️"
          actionLabel="Start Shopping"
          onAction={() => navigation.navigate("HomeTab")}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item }) => {
            const isCompleted = item.order_status === "delivered";
            const isCancelled = item.order_status === "cancelled";
            const isPaid = item.payment_status === "paid";

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate("OrderDetail", { orderId: item.id })
                }
                style={styles.orderCard}
              >
                {/* Top Row: Order # and Status */}
                <View style={styles.cardTopRow}>
                  <View>
                    <Text style={styles.orderNumber}>{item.order_number}</Text>
                    <Text style={styles.orderDate}>
                      {formatDateTime(item.created_at)}
                    </Text>
                  </View>

                  <Badge
                    label={item.order_status.replace(/_/g, " ")}
                    variant={
                      isCompleted
                        ? "success"
                        : isCancelled
                        ? "error"
                        : "warning"
                    }
                  />
                </View>

                {/* Items Summary Preview */}
                <View style={styles.itemsPreview}>
                  <Text style={styles.itemsSummaryText} numberOfLines={2}>
                    {item.order_items?.map((i) => `${i.quantity}x ${i.product_name}`).join(", ") ||
                      "Grocery Items"}
                  </Text>
                </View>

                {/* Bottom Row: Amount & Action */}
                <View style={styles.cardBottomRow}>
                  <View>
                    <Text style={styles.totalAmount}>
                      {formatCurrency(item.total_amount)}
                    </Text>
                    <Text style={styles.paymentInfo}>
                      {item.payment_method.toUpperCase()} • {item.payment_status}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("OrderTracking", { orderId: item.id })
                    }
                    style={styles.trackBtn}
                  >
                    <Text style={styles.trackBtnText}>Track Order →</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: "600",
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemsPreview: {
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  itemsSummaryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  paymentInfo: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  trackBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
});
