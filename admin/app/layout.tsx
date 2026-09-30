import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shree Jee Kirana - Admin Portal",
  description: "Store Management, Inventory, UPI Orders & Real-time Delivery Tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
