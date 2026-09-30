# 🏪 Shree Jee Kirana — Local General Store Full-Stack Application

A complete, production-grade, full-stack application built for a local Indian general store (**"Shree Jee Kirana"**). Features a **React Native CLI Customer Mobile App (Android & iOS)**, a **Next.js Web Admin Dashboard**, and a **Supabase PostgreSQL Backend** with Row Level Security (RLS), atomic stock management, push notifications (FCM), Google Maps delivery pinning, and an isolated **General UPI Payment System (Strictly Zero Razorpay)**.

---

## 🌟 Key Architecture & Highlights

- **Pure React Native CLI (No Expo / No Expo Router)**: Native `android/` and `ios/` folders with proper Gradle and Podfile configurations, package queries for UPI apps on Android 11+, and iOS URL schemes.
- **Genuine Indian UPI Payment System (Zero Razorpay)**: Conforms to NPCI specifications (`upi://pay`), supporting direct intent launch to **Google Pay, PhonePe, Paytm, BHIM**, or any installed UPI application.
- **Strict Server-Side Truth & Verification**: Item prices, discounts, delivery fees, and order totals are calculated and locked on the backend. Payments are verified via server functions before order confirmation and atomic inventory deduction.
- **Admin Management Portal (Next.js 14 + Tailwind CSS)**: Web portal for store owners to manage live orders, change delivery statuses (`Pending` → `Confirmed` → `Preparing` → `Out for Delivery` → `Delivered`), track UPI transactions, update inventory stock, manage categories/products, and broadcast push notifications.
- **Robust Inventory Safety**: Prevents overselling, validates cart quantities against live stock, and automatically restocks items if an order is cancelled.
- **Google Maps Integration**: Pin exact delivery coordinates with auto-fill, with seamless manual address entry fallback if location permission is declined.

---

## 📂 Project Directory Structure

```
shree-jee-kirana/
├── mobile/                      # React Native CLI Customer Mobile Application
│   ├── android/                 # Native Android project (Gradle, AndroidManifest)
│   ├── ios/                     # Native iOS project (Podfile, Info.plist)
│   ├── src/
│   │   ├── components/          # Reusable UI (Button, Input, ProductCard, MapPicker...)
│   │   ├── screens/             # Splash, Onboarding, Auth, Home, Catalog, Cart, Checkout, Orders, Profile
│   │   ├── navigation/          # RootNavigator, AuthNavigator, MainTabNavigator, Deep Linking
│   │   ├── services/
│   │   │   ├── payment/         # Isolated UPI payment architecture & adapters
│   │   │   └── supabase/        # Auth, product, order, address, notification services
│   │   ├── store/               # Zustand stores (cartStore, authStore, addressStore)
│   │   ├── utils/               # Form validation (Zod) and currency/date formatters
│   │   └── constants/           # Brand theme colors, typography, store config
│   ├── __tests__/               # Jest test suite (cart calculations, Zod, UPI URI)
│   ├── package.json
│   └── tsconfig.json
│
├── admin/                       # Next.js 14 Web Administration Dashboard
│   ├── app/
│   │   ├── login/               # Store Owner / Staff Login
│   │   └── (dashboard)/         # Protected dashboard routes
│   │       ├── page.tsx         # Dashboard overview (KPIs, revenue, alerts)
│   │       ├── products/        # Product catalog CRUD with stock & discount controls
│   │       ├── categories/      # Category management
│   │       ├── inventory/       # Stock replenishment (+10, +25, +50) & low stock alerts
│   │       ├── orders/          # Live order pipeline & status transition workflows
│   │       ├── customers/       # Customer directory & order statistics
│   │       ├── notifications/   # Store broadcasts & FCM push notifications
│   │       └── settings/        # Store timings, UPI VPA, COD toggle, delivery thresholds
│   ├── components/              # Sidebar, Header, StatCards, Modals
│   ├── lib/                     # Supabase browser & service-role clients, types
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/                    # Backend database migrations & Edge Functions
│   ├── migrations/
│   │   ├── 001_initial_schema.sql         # Profiles, categories, products, orders, items
│   │   ├── 002_rls_policies.sql           # Customer & Admin Row Level Security
│   │   └── 003_functions_and_triggers.sql # create_verified_order, verify_and_complete_payment
│   ├── functions/
│   │   ├── create-order/                  # Atomic server-side order calculation
│   │   ├── verify-payment/                # UPI transaction reconciliation & stock locking
│   │   └── send-push-notification/        # FCM v1 HTTP API push handler
│   └── seed/
│       └── seed.sql                       # 10 categories & 40+ authentic Indian grocery products
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 🛠️ Prerequisites & System Requirements

### For Mobile App Development (React Native CLI):
1. **Node.js**: v18.0.0 or later (v20+ LTS recommended)
2. **Java Development Kit (JDK)**: JDK 17 (Azul Zulu or Eclipse Temurin)
3. **Android Studio**:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34.0.0
   - Android Virtual Device (AVD) or physical Android device with USB debugging enabled
   - Configure environment variables: `ANDROID_HOME`, add `%ANDROID_HOME%\platform-tools` to `PATH`
4. **macOS & Xcode** (Required for iOS builds only):
   - macOS Sonoma or later
   - Xcode 15+
   - CocoaPods (`sudo gem install cocoapods`)
   - *Note: On Windows, iOS native binaries cannot be built directly; the iOS project structure and Podfile are fully prepared for macOS.*

### For Backend & Cloud Services:
1. **Supabase Account**: A free or pro project on [supabase.com](https://supabase.com).
2. **Firebase Account**: Firebase project with Cloud Messaging (FCM) enabled.
3. **Google Cloud Console**: Google Maps API Key with Maps SDK for Android & iOS, Geocoding API enabled.
4. **UPI Merchant Account / VPA**: Any active Indian UPI Virtual Payment Address (e.g. `yourstore@upi`, `yourstore@okaxis`, `yourstore@icici`).

---

## 🚀 Step-by-Step Setup Guide

### 1. Database Setup (Supabase)

1. Open your project on [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** and run the migration files in numerical order:
   - `supabase/migrations/001_initial_schema.sql` (Creates all tables and indexes)
   - `supabase/migrations/002_rls_policies.sql` (Enables Row Level Security)
   - `supabase/migrations/003_functions_and_triggers.sql` (Stored procedures for verified order creation, stock deduction, and payment confirmation)
3. Run `supabase/seed/seed.sql` to populate initial categories and 40+ realistic products (Atta, Rice, Dal, Fortune Oil, Amul Butter, Parle-G, Surf Excel, etc.).
4. In your Supabase Dashboard:
   - Navigate to **Authentication** -> **Users** and invite/create an admin user.
   - Run this SQL query to grant admin privileges:
     ```sql
     UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_UUID';
     ```

---

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env` in the root, `admin/`, and `mobile/` directories:

#### In `admin/.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...  # Service role key for admin tasks
FCM_SERVER_KEY=AAAA...
```

#### In `mobile/.env`:
```env
REACT_NATIVE_SUPABASE_URL=https://your-project.supabase.co
REACT_NATIVE_SUPABASE_ANON_KEY=eyJhbGciOi...  # ANON KEY ONLY (Never service role)
REACT_NATIVE_UPI_VPA=shreejeekirana@upi
REACT_NATIVE_UPI_NAME=Shree Jee Kirana
REACT_NATIVE_PAYMENT_MODE=intent
REACT_NATIVE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

---

### 3. Run Admin Dashboard (Next.js)

```bash
cd admin
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser:
- Log in with your admin credentials.
- View live sales KPIs, manage incoming orders, replenish stock, and broadcast announcements.

To build for production:
```bash
npm run build
npm start
```

---

### 4. Run Customer Mobile Application (React Native CLI)

#### For Android:
1. Start an Android emulator or connect an Android device via USB (`adb devices`).
2. Navigate to `mobile/`:
   ```bash
   cd mobile
   npm install
   ```
3. Start the Metro Bundler:
   ```bash
   npm start
   ```
4. In a separate terminal, launch the Android app:
   ```bash
   npm run android
   ```

#### For iOS (macOS required):
1. Navigate to `mobile/ios` and install CocoaPods dependencies:
   ```bash
   cd mobile/ios
   pod install
   cd ..
   ```
2. Launch the iOS simulator:
   ```bash
   npm run ios
   ```

---

## 💳 UPI Payment Architecture & Provider Activation

### Pluggable Payment Module
All payment logic resides in `mobile/src/services/payment/`:
- `upi/upiIntent.ts`: Generates NPCI-compliant deep links:
  `upi://pay?pa={vpa}&pn={merchantName}&mc={mcc}&tr={transactionRef}&tn={note}&am={amount}&cu=INR`
- `upi/upiApps.ts`: Discovers installed UPI apps (Google Pay, PhonePe, Paytm, BHIM, Generic Intent).
- `adapters/upiIntentAdapter.ts`: Native UPI Intent launcher.
- `adapters/phonePeAdapter.ts`: PhonePe Gateway adapter.
- `adapters/mockAdapter.ts`: Sandbox development simulator (for emulator testing without physical banking apps).
- `upi/serverVerify.ts`: Contacts the backend to confirm transaction authenticity.

### Going Live with Production UPI Payments
To accept live UPI payments in production:
1. **Direct UPI Intent**:
   - Set `UPI_MERCHANT_VPA` in `store_settings` to your registered Merchant UPI ID (e.g., `shreejee@okicici`).
   - Customer payments are routed directly to your current/merchant bank account.
2. **Payment Gateway Mode (e.g. PhonePe PG / Cashfree)**:
   - Complete merchant KYC with the PSP provider.
   - Enter your `MERCHANT_ID` and `SALT_KEY` in Supabase Edge Functions environment variables.
   - Set `PAYMENT_MODE=gateway` in the environment configuration.

---

## 🧪 Running Automated Tests

Run the test suite inside the `mobile/` directory:

```bash
cd mobile
npm test
```

Tests include:
- **`cartStore.test.ts`**: Subtotal, discount savings, free delivery threshold triggers, quantity updates, and stock protection boundaries.
- **`validation.test.ts`**: Zod schemas for user login, signup with 10-digit Indian phone validation, and 6-digit Indian PIN codes.
- **`upiPayment.test.ts`**: NPCI UPI URI generation, URL parameter encoding, and payment service adapter resolution.

---

## 🔒 Security & Privacy Guarantees

1. **Zero Razorpay**: Not a single file or dependency imports Razorpay.
2. **Never Trust Client Totals**: Final prices and totals are computed strictly on the PostgreSQL server using row locks.
3. **No Service-Role Key in Mobile**: The customer mobile application only uses the public anonymous Supabase key with Row Level Security.
4. **Prevent Overselling**: Inventory stock is locked and deducted upon verified payment confirmation. If an order is cancelled, stock is automatically returned.

---

## 📞 Support & Store Information
- **Store Name**: Shree Jee Kirana
- **Location**: Lal Bagh, Kothariya Road, Nathdwara, Pincode 313301
- **Helpline**: +91 9079192291
- **Email**: contact@shreejeekirana.com
