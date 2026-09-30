import { Linking, Platform } from "react-native";
import { UPIAppInfo, SupportedUpiAppId } from "../types";

export const SUPPORTED_UPI_APPS: UPIAppInfo[] = [
  {
    id: "google_pay",
    name: "Google Pay",
    packageNameAndroid: "com.google.android.apps.nbu.paisa.user",
    schemeIOS: "tez://upi/pay",
    iconName: "google-pay",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    packageNameAndroid: "com.phonepe.app",
    schemeIOS: "phonepe://pay",
    iconName: "phonepe",
  },
  {
    id: "paytm",
    name: "Paytm UPI",
    packageNameAndroid: "net.one97.paytm",
    schemeIOS: "paytmmp://pay",
    iconName: "paytm",
  },
  {
    id: "bhim",
    name: "BHIM UPI",
    packageNameAndroid: "in.org.npci.upiapp",
    schemeIOS: "bhim://pay",
    iconName: "bhim",
  },
  {
    id: "generic_upi",
    name: "Any UPI App",
    packageNameAndroid: "",
    schemeIOS: "upi://pay",
    iconName: "upi",
  },
];

/**
 * Checks which UPI applications are installed on the customer device.
 */
export async function detectInstalledUPIApps(): Promise<UPIAppInfo[]> {
  const verifiedApps: UPIAppInfo[] = [];

  for (const app of SUPPORTED_UPI_APPS) {
    if (app.id === "generic_upi") {
      // Generic UPI intent is always an option
      verifiedApps.push({ ...app, isInstalled: true });
      continue;
    }

    try {
      const scheme =
        Platform.OS === "ios"
          ? app.schemeIOS
          : `upi://pay`; // On Android, queries in AndroidManifest allow checking package / intent

      const supported = await Linking.canOpenURL(scheme);
      verifiedApps.push({ ...app, isInstalled: supported });
    } catch {
      verifiedApps.push({ ...app, isInstalled: false });
    }
  }

  return verifiedApps;
}
