import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList, RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { Category, Product } from "../../types/models";
import { productService } from "../../services/supabase/productService";
import { CategoryPill } from "../../components/CategoryPill";
import { ProductCard } from "../../components/ProductCard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useCartStore } from "../../store/cartStore";

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "HomeTab">,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cartItemCount = useCartStore((state) => state.getItemCount());

  const loadData = async () => {
    try {
      const [cats, featured, discounted, all] = await Promise.all([
        productService.getCategories(),
        productService.getFeaturedProducts(),
        productService.getDiscountedProducts(),
        productService.getProducts(),
      ]);

      setCategories(cats);
      setFeaturedProducts(featured);
      setDiscountedProducts(discounted);
      setAllProducts(all);
    } catch (e) {
      console.error("Home data load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <LoadingSpinner message="Fetching fresh groceries..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View>
          <View style={styles.storeRow}>
            <Text style={styles.storeEmoji}>🏪</Text>
            <Text style={styles.storeName}>Shree Jee Kirana</Text>
          </View>
          <Text style={styles.storeLocation}>📍 Lal Bagh, Nathdwara • Open Today</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            style={styles.iconButton}
          >
            <Text style={styles.actionIcon}>🔔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("CartTab")}
            style={styles.cartButton}
          >
            <Text style={styles.cartEmoji}>🛒</Text>
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Search Bar Shortcut */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Search", {})}
          style={styles.searchBar}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>
            Search "Atta", "Oil", "Parle-G", "Detergent"...
          </Text>
        </TouchableOpacity>

        {/* Promotional Delivery Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerTextContainer}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>STORE SPECIAL</Text>
            </View>
            <Text style={styles.bannerTitle}>FREE Local Delivery</Text>
            <Text style={styles.bannerSubtitle}>On grocery orders above ₹499</Text>
          </View>
          <Text style={styles.bannerEmoji}>🛵</Text>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("CategoriesTab", {})}
          >
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <CategoryPill
              category={item}
              onPress={() =>
                navigation.navigate("CategoriesTab", {
                  selectedCategoryId: item.id,
                })
              }
            />
          )}
        />

        {/* Featured Essentials */}
        {featuredProducts.length > 0 && (
          <View style={styles.productSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Featured Daily Essentials</Text>
                <Text style={styles.sectionSubtitle}>Handpicked staples for your home</Text>
              </View>
            </View>

            <View style={styles.grid}>
              {featuredProducts.slice(0, 4).map((product) => (
                <View key={product.id} style={styles.gridCol}>
                  <ProductCard
                    product={product}
                    onPress={() =>
                      navigation.navigate("ProductDetail", { product })
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Discounted Products */}
        {discountedProducts.length > 0 && (
          <View style={styles.productSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Special Kirana Offers 🏷️</Text>
                <Text style={styles.sectionSubtitle}>Save big on everyday packaged foods</Text>
              </View>
            </View>

            <FlatList
              data={discountedProducts}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductsList}
              renderItem={({ item }) => (
                <View style={styles.horizontalCardWrapper}>
                  <ProductCard
                    product={item}
                    onPress={() =>
                      navigation.navigate("ProductDetail", { product: item })
                    }
                  />
                </View>
              )}
            />
          </View>
        )}

        {/* All Products Catalog */}
        <View style={styles.productSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recently Added to Store</Text>
              <Text style={styles.sectionSubtitle}>Browse all stocked kirana items</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {allProducts.slice(0, 8).map((product) => (
              <View key={product.id} style={styles.gridCol}>
                <ProductCard
                  product={product}
                  onPress={() =>
                    navigation.navigate("ProductDetail", { product })
                  }
                />
              </View>
            ))}
          </View>
        </View>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  storeEmoji: {
    fontSize: 20,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primaryDark,
  },
  storeLocation: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 16,
  },
  cartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartEmoji: {
    fontSize: 16,
  },
  cartBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: COLORS.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: "800",
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: SPACING.sm,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  bannerTextContainer: {
    flex: 1,
  },
  tagBadge: {
    backgroundColor: "rgba(0,0,0,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  tagBadgeText: {
    color: COLORS.textWhite,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.textWhite,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "#FFF7ED",
    marginTop: 2,
    fontWeight: "600",
  },
  bannerEmoji: {
    fontSize: 38,
    marginLeft: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  categoriesList: {
    paddingBottom: SPACING.lg,
  },
  productSection: {
    marginTop: SPACING.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  gridCol: {
    width: "48%",
    marginBottom: SPACING.sm,
  },
  horizontalProductsList: {
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  horizontalCardWrapper: {
    width: 170,
  },
});
