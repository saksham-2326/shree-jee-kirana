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
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList, RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { formatCurrency } from "../../utils/formatters";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { storeService } from "../../services/supabase/notificationService";
import { productService } from "../../services/supabase/productService";
import { StoreSettings } from "../../types/models";
import { CartItemRow } from "../../components/CartItemRow";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../../components/Button";

type CartScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "CartTab">,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: CartScreenNavigationProp;
};

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const { items, clearCart, getSubtotal, getDiscountSavings, getDeliveryFee, getFinalTotal, validateCartStock } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const s = await storeService.getStoreSettings();
      setStoreSettings(s);
    }
    loadSettings();
  }, []);

  const subtotal = getSubtotal();
  const discountSavings = getDiscountSavings();
  const freeThreshold = storeSettings?.free_delivery_threshold || 499;
  const standardFee = storeSettings?.delivery_fee || 30;
  const deliveryFee = getDeliveryFee(freeThreshold, standardFee);
  const finalTotal = getFinalTotal(freeThreshold, standardFee);
  const amountNeededForFreeDelivery = Math.max(0, freeThreshold - subtotal);

  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Login Required",
        "Please sign in or create an account to proceed to checkout.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => navigation.navigate("Auth") },
        ]
      );
      return;
    }

    if (storeSettings && !storeSettings.is_store_open) {
      Alert.alert(
        "Store Closed",
        "Shree Jee Kirana is currently closed for new orders. Please try again during opening hours."
      );
      return;
    }

    if (storeSettings && subtotal < storeSettings.min_order_amount) {
      Alert.alert(
        "Minimum Order Required",
        `Store minimum order amount is ₹${storeSettings.min_order_amount}. Please add ₹${storeSettings.min_order_amount - subtotal} more items.`
      );
      return;
    }

    // Validate cart stock against latest products from server
    setValidating(true);
    try {
      const latestProducts = await productService.getProducts();
      const validation = validateCartStock(latestProducts);
      if (!validation.isValid) {
        Alert.alert(
          "Cart Stock Update",
          validation.issues.join("\n\n") + "\n\nPlease review your updated quantities."
        );
        return;
      }

      navigation.navigate("Checkout");
    } catch {
      navigation.navigate("Checkout");
    } finally {
      setValidating(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Grocery Cart</Text>
        </View>
        <EmptyState
          title="Your Cart is Empty"
          description="Your grocery basket is looking a bit light! Explore fresh flour, spices, snacks, and daily staples."
          icon="🛒"
          actionLabel="Explore Groceries"
          onAction={() => navigation.navigate("HomeTab")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Grocery Cart</Text>
          <Text style={styles.headerSub}>
            {items.reduce((s, i) => s + i.quantity, 0)} items in basket
          </Text>
        </View>
        <TouchableOpacity onPress={clearCart} style={styles.clearCartBtn}>
          <Text style={styles.clearCartText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Free Delivery Threshold Banner */}
        {amountNeededForFreeDelivery > 0 ? (
          <View style={styles.freeDeliveryBanner}>
            <Text style={styles.freeDeliveryIcon}>🛵</Text>
            <View style={styles.freeDeliveryContent}>
              <Text style={styles.freeDeliveryText}>
                Add <Text style={styles.highlightText}>₹{amountNeededForFreeDelivery}</Text> more to unlock <Text style={styles.highlightText}>FREE Delivery</Text>!
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.unlockedBanner}>
            <Text style={styles.unlockedIcon}>🎉</Text>
            <Text style={styles.unlockedText}>
              Congratulations! You have unlocked FREE Doorstep Delivery!
            </Text>
          </View>
        )}

        {/* Cart Items List */}
        <View style={styles.itemsList}>
          {items.map((item) => (
            <CartItemRow key={item.product.id} item={item} />
          ))}
        </View>

        {/* Bill Summary Card */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Summary</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Subtotal</Text>
            <Text style={styles.billValue}>{formatCurrency(subtotal)}</Text>
          </View>

          {discountSavings > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.savingsLabel}>Store Discount Savings</Text>
              <Text style={styles.savingsValue}>
                -{formatCurrency(discountSavings)}
              </Text>
            </View>
          )}

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text
              style={[
                styles.billValue,
                deliveryFee === 0 && styles.freeDeliveryValue,
              ]}
            >
              {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>To Pay</Text>
              <Text style={styles.taxSub}>Inclusive of all taxes</Text>
            </View>
            <Text style={styles.totalValue}>{formatCurrency(finalTotal)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total Amount</Text>
          <Text style={styles.bottomTotalValue}>{formatCurrency(finalTotal)}</Text>
        </View>

        <Button
          title="Proceed to Checkout →"
          onPress={handleProceedToCheckout}
          loading={validating}
          size="lg"
          style={styles.checkoutBtn}
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
    fontWeight: "600",
  },
  clearCartBtn: {
    padding: SPACING.xs,
  },
  clearCartText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 110,
  },
  freeDeliveryBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  freeDeliveryIcon: {
    fontSize: 24,
  },
  freeDeliveryContent: {
    flex: 1,
  },
  freeDeliveryText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "700",
    marginBottom: 6,
  },
  highlightText: {
    color: "#B45309",
    fontWeight: "900",
  },
  progressBarBg: {
    height: 5,
    backgroundColor: "#FDE68A",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  unlockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + "40",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  unlockedIcon: {
    fontSize: 20,
  },
  unlockedText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  itemsList: {
    marginBottom: SPACING.md,
  },
  billCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  billValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  savingsLabel: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
  savingsValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  freeDeliveryValue: {
    color: COLORS.primaryDark,
    fontWeight: "800",
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
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  taxSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...SHADOWS.lg,
  },
  bottomTotalLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  bottomTotalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  checkoutBtn: {
    minWidth: 200,
  },
});
