import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { MainTabParamList, RootStackParamList } from "../../types/navigation";
import { Category, Product } from "../../types/models";
import { productService } from "../../services/supabase/productService";
import { ProductCard } from "../../components/ProductCard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";

type ProductListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<MainTabParamList, "CategoriesTab">;
};

export const ProductListScreen: React.FC<ProductListScreenProps> = ({
  navigation,
  route,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    route.params?.selectedCategoryId || null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
        if (!selectedCategoryId && cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (route.params?.selectedCategoryId) {
      setSelectedCategoryId(route.params.selectedCategoryId);
    }
  }, [route.params?.selectedCategoryId]);

  useEffect(() => {
    async function loadCategoryProducts() {
      if (!selectedCategoryId) return;
      setLoading(true);
      try {
        const prods = await productService.getProducts(selectedCategoryId);
        setProducts(prods);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryProducts();
  }, [selectedCategoryId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Category Pills Header */}
      <View style={styles.categoriesBar}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedCategoryId;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategoryId(item.id)}
                style={[
                  styles.categoryTab,
                  isSelected && styles.categoryTabSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    isSelected && styles.categoryTabTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner message="Loading category products..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products in this Category"
          description="We are currently stocking new items for this section. Please check back shortly!"
          icon="📦"
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.navigate("ProductDetail", { product: item })
                }
              />
            </View>
          )}
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
  categoriesBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  categoryTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.borderLight,
    marginRight: SPACING.sm,
  },
  categoryTabSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  categoryTabTextSelected: {
    color: COLORS.textWhite,
  },
  productsGrid: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  cardWrapper: {
    width: "48%",
  },
});
