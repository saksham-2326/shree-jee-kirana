import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { linking } from "./linking";

// Screens
import { SplashScreen } from "../screens/splash/SplashScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabNavigator } from "./MainTabNavigator";
import { ProductDetailScreen } from "../screens/products/ProductDetailScreen";
import { SearchScreen } from "../screens/products/SearchScreen";
import { CheckoutScreen } from "../screens/checkout/CheckoutScreen";
import { AddressSelectScreen } from "../screens/checkout/AddressSelectScreen";
import { AddEditAddressScreen } from "../screens/checkout/AddEditAddressScreen";
import { OrderDetailScreen } from "../screens/orders/OrderDetailScreen";
import { OrderTrackingScreen } from "../screens/orders/OrderTrackingScreen";
import { NotificationScreen } from "../screens/notifications/NotificationScreen";
import { EditProfileScreen } from "../screens/profile/EditProfileScreen";
import { SettingsScreen } from "../screens/profile/SettingsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="AddressSelect" component={AddressSelectScreen} />
        <Stack.Screen name="AddEditAddress" component={AddEditAddressScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
