import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Product } from "../types/models";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../constants/theme";
import { formatCurrency } from "../utils/formatters";
import { useCartStore } from "../store/cartStore";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  style?: ViewStyle;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style,
}) => {
  const { items, addItem, updateQuantity } = useCartStore();

  const cartItem = items.find((item) => item.product.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;
  const isOutOfStock = product.stock_quantity <= 0;

  const handleAdd = () => {
    addItem(product, 1);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, currentQuantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, currentQuantity - 1);
  };

  const displayPrice = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price !== null && product.discount_price < product.price;
  const discountSavings = hasDiscount ? product.price - product.discount_price! : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, style]}
    >
      {/* Product Image & Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              product.images && product.images[0]
                ? product.images[0]
                : "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop",
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>₹{discountSavings} OFF</Text>
          </View>
        )}

        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        {product.brand ? (
          <Text style={styles.brandText} numberOfLines={1}>
            {product.brand}
          </Text>
        ) : null}

        <Text style={styles.nameText} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.unitText}>{product.unit}</Text>

        {/* Price & Action Row */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceText}>{formatCurrency(displayPrice)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPriceText}>
                {formatCurrency(product.price)}
              </Text>
            )}
          </View>

          {isOutOfStock ? (
            <View style={styles.soldOutPill}>
              <Text style={styles.soldOutText}>Unavailable</Text>
            </View>
          ) : currentQuantity === 0 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAdd}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.counterRow}>
              <TouchableOpacity
                onPress={handleDecrement}
                style={styles.counterBtn}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterQtyText}>{currentQuantity}</Text>
              <TouchableOpacity
                onPress={handleIncrement}
                disabled={currentQuantity >= product.stock_quantity}
                style={[
                  styles.counterBtn,
                  currentQuantity >= product.stock_quantity && styles.counterBtnDisabled,
                ]}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  imageContainer: {
    width: "100%",
    height: 125,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  discountText: {
    color: COLORS.textWhite,
    fontSize: 9,
    fontWeight: "800",
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  outOfStockText: {
    color: COLORS.textWhite,
    fontWeight: "bold",
    fontSize: 11,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  infoContainer: {
    padding: SPACING.md,
    flex: 1,
    justifyContent: "space-between",
  },
  brandText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  nameText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 17,
  },
  unitText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  originalPriceText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
  },
  addButton: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  addButtonText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  counterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  counterBtnDisabled: {
    opacity: 0.4,
  },
  counterBtnText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: "bold",
  },
  counterQtyText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: "bold",
    minWidth: 18,
    textAlign: "center",
  },
  soldOutPill: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  soldOutText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
});
