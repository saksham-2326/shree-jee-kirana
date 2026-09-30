"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Profile, Order } from "@/lib/types";
import { Users, Search, RefreshCw, ShoppingBag, Phone, Mail, Calendar } from "lucide-react";

interface CustomerStats extends Profile {
  order_count: number;
  total_spent: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles where role = customer
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer")
        .order("created_at", { ascending: false });

      if (pErr) throw pErr;

      // 2. Fetch orders to compute stats
      const { data: orders } = await supabase
        .from("orders")
        .select("user_id, total_amount, payment_status, order_status");

      const orderMap = new Map<string, { count: number; spent: number }>();
      (orders || []).forEach((o) => {
        if (!orderMap.has(o.user_id)) {
          orderMap.set(o.user_id, { count: 0, spent: 0 });
        }
        const curr = orderMap.get(o.user_id)!;
        curr.count++;
        if (o.payment_status === "paid" && o.order_status !== "cancelled") {
          curr.spent += Number(o.total_amount) || 0;
        }
      });

      const enriched: CustomerStats[] = (profiles || []).map((p) => {
        const stats = orderMap.get(p.id) || { count: 0, spent: 0 };
        return {
          ...p,
          order_count: stats.count,
          total_spent: stats.spent,
        };
      });

      setCustomers(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            View registered store shoppers and their purchase history
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Total Spent (₹)</th>
                <th className="py-3 px-4">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{c.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {c.phone || "Not provided"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                        {c.order_count} orders
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{c.total_spent.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(c.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
