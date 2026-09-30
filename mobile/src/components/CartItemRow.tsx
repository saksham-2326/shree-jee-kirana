import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { CartItem } from "../types/models";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { formatCurrency } from "../utils/formatters";
import { useCartStore } from "../store/cartStore";

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();
  const product = item.product;
  const unitPrice = product.discount_price ?? product.price;
  const itemTotal = unitPrice * item.quantity;

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri:
            product.images && product.images[0]
              ? product.images[0]
              : "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&auto=format&fit=crop",
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <TouchableOpacity
            onPress={() => removeItem(product.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.unitText}>{product.unit}</Text>

        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.totalPrice}>{formatCurrency(itemTotal)}</Text>
            <Text style={styles.unitPrice}>
              {formatCurrency(unitPrice)} / unit
            </Text>
          </View>

          <View style={styles.counterRow}>
            <TouchableOpacity
              onPress={() => updateQuantity(product.id, item.quantity - 1)}
              style={styles.counterBtn}
            >
              <Text style={styles.counterBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.counterQtyText}>{item.quantity}</Text>

            <TouchableOpacity
              onPress={() => updateQuantity(product.id, item.quantity + 1)}
              disabled={item.quantity >= product.stock_quantity}
              style={[
                styles.counterBtn,
                item.quantity >= product.stock_quantity && styles.counterBtnDisabled,
              ]}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
    alignItems: "center",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: "#F1F5F9",
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 17,
  },
  deleteButton: {
    padding: 2,
    marginLeft: 6,
  },
  deleteText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "bold",
  },
  unitText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  unitPrice: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  counterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  counterBtnDisabled: {
    opacity: 0.3,
  },
  counterBtnText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: "bold",
  },
  counterQtyText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "800",
    minWidth: 20,
    textAlign: "center",
  },
});
