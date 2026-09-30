"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Order, OrderStatus } from "@/lib/types";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, profile:profiles(full_name, phone)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setOrders(data as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const addr = o.delivery_address_snapshot;
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (addr?.full_name && addr.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (addr?.phone && addr.phone.includes(search)) ||
      (o.upi_transaction_ref && o.upi_transaction_ref.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Order Pipeline</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Process incoming orders, track UPI payments, and dispatch deliveries
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm text-xs">
          {[
            { id: "all", label: "All Orders" },
            { id: "pending", label: "Pending Payment" },
            { id: "confirmed", label: "Confirmed" },
            { id: "preparing", label: "Preparing" },
            { id: "out_for_delivery", label: "Out for Delivery" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, Customer Name, Phone, or UPI Ref..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Placed Date & Time</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No orders found matching this filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const addr = order.delivery_address_snapshot;
                  const dateStr = new Date(order.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {order.order_number}
                        {order.upi_transaction_ref && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Ref: {order.upi_transaction_ref}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{dateStr}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{addr?.full_name || "Customer"}</p>
                        <p className="text-[11px] text-slate-500">
                          {addr?.phone} • {addr?.city} ({addr?.pincode})
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        ₹{order.total_amount}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.payment_status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.payment_status === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                          <p className="text-[10px] text-slate-500 font-medium uppercase">
                            Method: {order.payment_method}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            order.order_status === "delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.order_status === "cancelled"
                              ? "bg-rose-100 text-rose-800"
                              : order.order_status === "out_for_delivery"
                              ? "bg-purple-100 text-purple-800"
                              : order.order_status === "preparing"
                              ? "bg-amber-100 text-amber-800"
                              : order.order_status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {order.order_status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition-all border border-emerald-200"
                        >
                          <span>Process</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
