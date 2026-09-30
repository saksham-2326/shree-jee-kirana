import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet, View } from "react-native";
import { Category } from "../types/models";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

interface CategoryPillProps {
  category: Category;
  isSelected?: boolean;
  onPress: () => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  category,
  isSelected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, isSelected && styles.selectedContainer]}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              category.icon_url ||
              "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&auto=format&fit=crop",
          }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <Text
        style={[styles.name, isSelected && styles.selectedName]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: SPACING.sm,
    width: 76,
  },
  selectedContainer: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + "30",
  },
  imageWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    backgroundColor: COLORS.borderLight,
    marginBottom: SPACING.xs,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  selectedName: {
    color: COLORS.primaryDark,
    fontWeight: "800",
  },
});
