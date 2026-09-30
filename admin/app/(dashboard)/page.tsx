"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Order, Product } from "@/lib/types";
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  ArrowUpRight,
  RefreshCw,
  Package,
} from "lucide-react";

interface DashboardStats {
  todayRevenue: number;
  totalRevenue: number;
  todayOrders: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  lowStockCount: number;
  outOfStockCount: number;
  customerCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    totalRevenue: 0,
    todayOrders: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    customerCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayIso = todayStart.toISOString();

      // 1. Fetch Orders
      const { data: allOrders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      const orders: Order[] = allOrders || [];

      let todayRev = 0;
      let totalRev = 0;
      let todayCount = 0;
      let pendingCount = 0;
      let deliveredCount = 0;

      orders.forEach((o) => {
        const isPaid = o.payment_status === "paid" || o.payment_method === "cod";
        if (isPaid && o.order_status !== "cancelled") {
          totalRev += Number(o.total_amount) || 0;
        }

        if (o.created_at >= todayIso) {
          todayCount++;
          if (isPaid && o.order_status !== "cancelled") {
            todayRev += Number(o.total_amount) || 0;
          }
        }

        if (["pending", "confirmed", "preparing", "out_for_delivery"].includes(o.order_status)) {
          pendingCount++;
        }
        if (o.order_status === "delivered") {
          deliveredCount++;
        }
      });

      // 2. Fetch Products for Stock Analytics
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, brand, stock_quantity, unit, price, discount_price")
        .order("stock_quantity", { ascending: true });

      const products: Product[] = (productsData as any) || [];
      const lowStock = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5);
      const outOfStock = products.filter((p) => p.stock_quantity === 0);

      // 3. Fetch Customer Count
      const { count: customers } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "customer");

      setStats({
        todayRevenue: todayRev,
        totalRevenue: totalRev,
        todayOrders: todayCount,
        totalOrders: orders.length,
        pendingOrders: pendingCount,
        deliveredOrders: deliveredCount,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        customerCount: customers || 0,
      });

      setRecentOrders(orders.slice(0, 6));
      setLowStockItems(products.slice(0, 5));
    } catch (e) {
      console.error("Dashboard data fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time orders, UPI transactions, and inventory status</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">₹{stats.todayRevenue.toLocaleString("en-IN")}</div>
            <p className="text-xs text-slate-500 mt-1">Total All-time: ₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Orders Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Orders</span>
            <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{stats.todayOrders}</div>
            <p className="text-xs text-slate-500 mt-1">{stats.totalOrders} total lifetime orders</p>
          </div>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Orders</span>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{stats.pendingOrders}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">{stats.deliveredOrders} orders delivered</p>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Alerts</span>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{stats.lowStockCount + stats.outOfStockCount}</div>
            <p className="text-xs text-rose-600 font-medium mt-1">
              {stats.outOfStockCount} out of stock, {stats.lowStockCount} low stock
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Stock Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live store order pipeline</p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No orders received yet. Once customers place orders, they will appear here in real time.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => {
                    const addr = order.delivery_address_snapshot;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{order.order_number}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{addr?.full_name || "Customer"}</p>
                          <p className="text-[11px] text-slate-500">{addr?.phone || "-"}</p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">₹{order.total_amount}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.payment_status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.payment_status === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {order.payment_method.toUpperCase()} • {order.payment_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.order_status === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.order_status === "cancelled"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.order_status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/orders/${order.id}`}
                            className="inline-flex px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px]"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1 Col: Urgent Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Stock Attention</h2>
              <p className="text-xs text-slate-500 mt-0.5">Items needing replenishment</p>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              <span>Inventory</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-4 flex-1 space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                All inventory items are well-stocked.
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.brand || "General"} • {item.unit}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.stock_quantity === 0
                          ? "bg-rose-100 text-rose-700"
                          : item.stock_quantity <= 5
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.stock_quantity === 0 ? "Out of Stock" : `${item.stock_quantity} left`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
