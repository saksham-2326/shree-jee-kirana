import { LinkingOptions } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["shreejeekirana://", "https://shreejeekirana.com"],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeTab: "home",
          CategoriesTab: "categories",
          CartTab: "cart",
          OrdersTab: "orders",
          ProfileTab: "profile",
        },
      },
      ProductDetail: "product/:productId",
      OrderDetail: "order/:orderId",
      OrderTracking: "track/:orderId",
      Checkout: "checkout",
    },
  },
};
