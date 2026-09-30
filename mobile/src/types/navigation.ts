import { Product, Order, Address } from "./models";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: { selectedCategoryId?: string } | undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  MainTabs: undefined;
  ProductDetail: { product: Product };
  Search: { initialQuery?: string };
  Checkout: undefined;
  AddressSelect: undefined;
  AddEditAddress: { address?: Address };
  OrderDetail: { orderId: string };
  OrderTracking: { orderId: string };
  Notifications: undefined;
  EditProfile: undefined;
  Settings: undefined;
};
