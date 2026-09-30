import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { formatCurrency } from "../../utils/formatters";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { useCartStore } from "../../store/cartStore";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ProductDetail">;
  route: RouteProp<RootStackParamList, "ProductDetail">;
};

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { product } = route.params;
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const { addItem } = useCartStore();

  const isOutOfStock = product.stock_quantity <= 0;
  const displayPrice = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price !== null && product.discount_price < product.price;
  const discountSavings = hasDiscount ? product.price - product.discount_price! : 0;

  const handleAddToCart = () => {
    const result = addItem(product, selectedQuantity);
    if (!result.success) {
      Alert.alert("Stock Notice", result.message || "Cannot add more items than available stock.");
    } else {
      Alert.alert(
        "Added to Cart",
        `${selectedQuantity}x ${product.name} added to your grocery basket.`,
        [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => navigation.navigate("MainTabs") },
        ]
      );
    }
  };

  const handleBuyNow = () => {
    const result = addItem(product, selectedQuantity);
    if (!result.success) {
      Alert.alert("Stock Notice", result.message || "Cannot add more items than available stock.");
      return;
    }
    navigation.navigate("Checkout");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("MainTabs")}
          style={styles.cartIconBtn}
        >
          <Text style={styles.cartEmoji}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Product Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                product.images && product.images[0]
                  ? product.images[0]
                  : "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop",
            }}
            style={styles.image}
            resizeMode="cover"
          />

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>₹{discountSavings} OFF</Text>
            </View>
          )}
        </View>

        {/* Product Details Section */}
        <View style={styles.detailsCard}>
          {product.brand ? (
            <Text style={styles.brandText}>{product.brand}</Text>
          ) : null}

          <Text style={styles.titleText}>{product.name}</Text>
          <Text style={styles.unitText}>{product.unit}</Text>

          {/* Pricing Row */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{formatCurrency(displayPrice)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                {formatCurrency(product.price)}
              </Text>
            )}
            {hasDiscount && (
              <Badge
                label={`${Math.round(((product.price - product.discount_price!) / product.price) * 100)}% OFF`}
                variant="success"
              />
            )}
          </View>

          {/* Stock Availability Pill */}
          <View style={styles.stockRow}>
            <Badge
              label={
                isOutOfStock
                  ? "Out of Stock"
                  : product.stock_quantity <= 5
                  ? `Only ${product.stock_quantity} Left in Stock`
                  : "In Stock"
              }
              variant={
                isOutOfStock
                  ? "error"
                  : product.stock_quantity <= 5
                  ? "warning"
                  : "success"
              }
            />
          </View>

          {/* Description */}
          {product.description ? (
            <View style={styles.descSection}>
              <Text style={styles.descHeader}>Product Details</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          ) : null}

          {/* Store Guarantee Box */}
          <View style={styles.guaranteeBox}>
            <View style={styles.guaranteeItem}>
              <Text style={styles.guaranteeEmoji}>✔️</Text>
              <Text style={styles.guaranteeText}>100% Genuine & Fresh</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Text style={styles.guaranteeEmoji}>⚡</Text>
              <Text style={styles.guaranteeText}>Instant Local Delivery</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Text style={styles.guaranteeEmoji}>💳</Text>
              <Text style={styles.guaranteeText}>Secure UPI Payment</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      {!isOutOfStock ? (
        <View style={styles.bottomBar}>
          {/* Quantity Selector */}
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              onPress={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{selectedQuantity}</Text>

            <TouchableOpacity
              onPress={() =>
                setSelectedQuantity((q) =>
                  Math.min(product.stock_quantity, q + 1)
                )
              }
              disabled={selectedQuantity >= product.stock_quantity}
              style={[
                styles.qtyBtn,
                selectedQuantity >= product.stock_quantity && styles.qtyBtnDisabled,
              ]}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <Button
              title="Add to Cart"
              variant="outline"
              onPress={handleAddToCart}
              style={styles.cartBtn}
            />
            <Button
              title="Buy Now"
              variant="primary"
              onPress={handleBuyNow}
              style={styles.buyNowBtn}
            />
          </View>
        </View>
      ) : (
        <View style={styles.bottomBarOut}>
          <Text style={styles.outOfStockBottomText}>
            This product is currently out of stock at Shree Jee Kirana.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    height: 52,
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
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginHorizontal: SPACING.sm,
  },
  cartIconBtn: {
    padding: SPACING.xs,
  },
  cartEmoji: {
    fontSize: 20,
  },
  content: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: "100%",
    height: 280,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  discountText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: "800",
  },
  detailsCard: {
    padding: SPACING.lg,
  },
  brandText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  unitText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  originalPrice: {
    fontSize: 15,
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
  },
  stockRow: {
    marginBottom: SPACING.lg,
  },
  descSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  descHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  descText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  guaranteeBox: {
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 8,
  },
  guaranteeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  guaranteeEmoji: {
    fontSize: 14,
  },
  guaranteeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
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
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  qtyBtnDisabled: {
    opacity: 0.3,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
    minWidth: 20,
    textAlign: "center",
  },
  actionButtonsRow: {
    flex: 1,
    flexDirection: "row",
    gap: SPACING.sm,
  },
  cartBtn: {
    flex: 1,
  },
  buyNowBtn: {
    flex: 1,
  },
  bottomBarOut: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.errorLight,
    padding: SPACING.lg,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.error + "40",
  },
  outOfStockBottomText: {
    color: COLORS.error,
    fontWeight: "700",
    fontSize: 13,
  },
});
