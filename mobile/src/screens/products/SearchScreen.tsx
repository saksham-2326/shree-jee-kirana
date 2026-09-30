import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import { Product } from "../../types/models";
import { productService } from "../../services/supabase/productService";
import { ProductCard } from "../../components/ProductCard";
import { EmptyState } from "../../components/EmptyState";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Search">;
  route: RouteProp<RootStackParamList, "Search">;
};

const POPULAR_SEARCHES = [
  "Atta",
  "Basmati Rice",
  "Fortune Oil",
  "Tata Salt",
  "Parle-G",
  "Amul Butter",
  "Surf Excel",
  "Dettol Soap",
  "Maggi",
  "Sugar",
];

export const SearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const [query, setQuery] = useState(route.params?.initialQuery || "");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const prods = await productService.searchProducts(query);
        setResults(prods);
        setHasSearched(true);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Search Bar Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search groceries, atta, snacks, soaps..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            style={styles.input}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body Content */}
      {loading ? (
        <LoadingSpinner message="Searching store catalog..." />
      ) : query.trim() === "" ? (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Popular Searches</Text>
          <View style={styles.chipsRow}>
            {POPULAR_SEARCHES.map((keyword) => (
              <TouchableOpacity
                key={keyword}
                onPress={() => setQuery(keyword)}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{keyword}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : results.length === 0 && hasSearched ? (
        <EmptyState
          title={`No results for "${query}"`}
          description="Try checking for spelling errors or searching with more general grocery terms like 'oil', 'dal', or 'biscuits'."
          icon="🔍"
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.resultsGrid}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backArrow: {
    fontSize: 22,
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  clearBtn: {
    padding: SPACING.xs,
  },
  clearText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "bold",
  },
  suggestionsContainer: {
    padding: SPACING.xl,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: SPACING.md,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  resultsGrid: {
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
