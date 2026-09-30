import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../types/navigation";
import { HomeScreen } from "../screens/home/HomeScreen";
import { ProductListScreen } from "../screens/products/ProductListScreen";
import { CartScreen } from "../screens/cart/CartScreen";
import { OrderListScreen } from "../screens/orders/OrderListScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { COLORS } from "../constants/theme";
import { useCartStore } from "../store/cartStore";

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const cartCount = useCartStore((state) => state.getItemCount());

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={ProductListScreen}
        options={{
          tabBarLabel: "Categories",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📑</Text>,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: "Cart",
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.error,
            fontSize: 10,
            fontWeight: "bold",
          },
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrderListScreen}
        options={{
          tabBarLabel: "Orders",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
