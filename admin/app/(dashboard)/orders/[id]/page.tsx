"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Order, OrderStatus } from "@/lib/types";
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), profile:profiles(full_name, phone, role)")
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrder(data as any);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async (newStatus: OrderStatus, reason?: string) => {
    setUpdating(true);
    setMessage(null);
    try {
      // Call secure stored procedure for status update & inventory handling
      const { data, error } = await supabase.rpc("admin_update_order_status", {
        p_order_id: orderId,
        p_new_status: newStatus,
        p_notes: reason || null,
      });

      if (error) throw error;
      setMessage(`Order status successfully updated to ${newStatus.replace(/_/g, " ")}`);
      setShowCancelPrompt(false);
      fetchOrder();
    } catch (e: any) {
      alert(e.message || "Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-500 text-xs">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-bold mb-4">Order not found.</p>
        <Link
          href="/orders"
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const addr = order.delivery_address_snapshot;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        <button
          onClick={fetchOrder}
          disabled={loading}
          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs shadow-sm flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{order.order_number}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.order_status === "delivered"
                  ? "bg-emerald-100 text-emerald-800"
                  : order.order_status === "cancelled"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {order.order_status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "medium" })}
          </p>
        </div>

        {/* Workflow Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {order.order_status === "pending" && (
            <button
              onClick={() => handleUpdateStatus("confirmed")}
              disabled={updating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm"
            >
              Confirm Order
            </button>
          )}

          {order.order_status === "confirmed" && (
            <button
              onClick={() => handleUpdateStatus("preparing")}
              disabled={updating}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm"
            >
              Start Packing Items
            </button>
          )}

          {order.order_status === "preparing" && (
            <button
              onClick={() => handleUpdateStatus("out_for_delivery")}
              disabled={updating}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm"
            >
              Dispatch For Delivery
            </button>
          )}

          {order.order_status === "out_for_delivery" && (
            <button
              onClick={() => handleUpdateStatus("delivered")}
              disabled={updating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm"
            >
              Mark Order Delivered
            </button>
          )}

          {order.order_status !== "delivered" && order.order_status !== "cancelled" && (
            <button
              onClick={() => setShowCancelPrompt(true)}
              disabled={updating}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-all"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Cancellation Prompt Modal */}
      {showCancelPrompt && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Confirm Order Cancellation (Items will be automatically returned to store inventory):</span>
          </div>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation (e.g. Customer requested, out of stock, address unreachable)..."
            className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleUpdateStatus("cancelled", cancelReason)}
              disabled={updating}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm"
            >
              Confirm Cancel & Restock
            </button>
            <button
              onClick={() => setShowCancelPrompt(false)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer & Address Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>Customer & Delivery Details</span>
          </h2>

          <div className="space-y-2 text-xs">
            <p className="font-bold text-slate-900 text-sm">{addr?.full_name}</p>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{addr?.phone}</span>
            </div>
            <div className="flex items-start gap-2 text-slate-600 pt-2 border-t border-slate-100">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">{addr?.house_building}, {addr?.street_area}</p>
                {addr?.landmark && <p className="text-slate-500">Landmark: {addr.landmark}</p>}
                <p className="text-slate-600">{addr?.city}, {addr?.state} - {addr?.pincode}</p>
                {addr?.delivery_instructions && (
                  <p className="mt-1 text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                    Note: {addr.delivery_instructions}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Verification Audit */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>UPI Payment & Verification Audit</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Payment Method</p>
              <p className="font-bold text-slate-800 uppercase mt-0.5">{order.payment_method}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Payment Status</p>
              <p className="font-bold text-emerald-700 uppercase mt-0.5">{order.payment_status}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
              <p className="text-slate-400 text-[10px] uppercase font-bold">UPI Transaction Reference</p>
              <p className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 truncate">
                {order.upi_transaction_ref || "N/A (Cash on Delivery)"}
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              All order amounts are locked on the backend. Total paid: <b>₹{order.total_amount}</b>.
            </span>
          </div>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Ordered Grocery Items ({order.order_items?.length || 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Unit Price (₹)</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4 text-right">Total Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.order_items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{item.product_name}</p>
                    <p className="text-[11px] text-slate-400">Unit: {item.unit}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">₹{item.unit_price}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">₹{item.total_item_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-slate-800">₹{order.subtotal}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Savings:</span>
                <span className="font-semibold">-₹{order.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-slate-800">
                {order.delivery_fee === 0 ? "FREE" : `₹${order.delivery_fee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Order Amount:</span>
              <span>₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
