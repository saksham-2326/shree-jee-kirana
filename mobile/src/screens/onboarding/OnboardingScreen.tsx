import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Button } from "../../components/Button";

const { width } = Dimensions.get("window");

interface Slide {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    emoji: "🌾",
    title: "Fresh Groceries & Daily Staples",
    description:
      "Explore pure chakki fresh atta, pulses, spices, edible oils, and packaged foods directly from your local Shree Jee Kirana store.",
  },
  {
    id: "2",
    emoji: "⚡",
    title: "Instant UPI Payments",
    description:
      "Pay securely using your favorite UPI app — Google Pay, PhonePe, Paytm, or BHIM with zero hassle and instant order confirmation.",
  },
  {
    id: "3",
    emoji: "🛵",
    title: "Quick Delivery or Store Pickup",
    description:
      "Get prompt doorstep delivery across your locality, or choose 'Pay & Collect at Store' for instant pre-packed pickup.",
  },
];

type OnboardingProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Onboarding">;
};

export const OnboardingScreen: React.FC<OnboardingProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    navigation.replace("Auth");
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <Text style={styles.brandTitle}>Shree Jee Kirana</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Pagination & Next Button */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentIndex ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>

        <Button
          title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
          onPress={handleNext}
          size="lg"
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingTop: 48,
    paddingBottom: SPACING.md,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primaryDark,
  },
  skipButton: {
    padding: SPACING.xs,
  },
  skipText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "700",
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xxxl,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xxl,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  emoji: {
    fontSize: 54,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.md,
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 40,
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  actionBtn: {
    width: "100%",
  },
});
