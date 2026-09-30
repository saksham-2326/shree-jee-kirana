"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/lib/types";
import {
  Boxes,
  AlertTriangle,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "low" | "out">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .order("stock_quantity", { ascending: true });
      if (error) throw error;
      if (data) setProducts(data as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (product: Product, delta: number) => {
    try {
      setUpdatingId(product.id);
      const newStock = Math.max(0, product.stock_quantity + delta);

      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", product.id);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock_quantity: newStock } : p))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleManualSetStock = async (product: Product, valueStr: string) => {
    const val = parseInt(valueStr, 10);
    if (isNaN(val) || val < 0) return;
    try {
      setUpdatingId(product.id);
      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: val })
        .eq("id", product.id);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock_quantity: val } : p))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));

    if (filterMode === "low") {
      return matchesSearch && p.stock_quantity > 0 && p.stock_quantity <= 5;
    }
    if (filterMode === "out") {
      return matchesSearch && p.stock_quantity === 0;
    }
    return matchesSearch;
  });

  const lowStockCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Inventory Control</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Monitor real-time stock levels and replenish kirana items quickly
          </p>
        </div>
        <button
          onClick={fetchInventory}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilterMode("low")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === "low"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterMode("out")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === "out"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items to restock..."
            className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Direct Input</th>
                <th className="py-3 px-4 text-right">Quick Restock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No products matching current inventory filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isUpdating = updatingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || "https://placehold.co/100"}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {p.brand ? `${p.brand} • ` : ""}
                              {p.unit}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{p.category?.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            p.stock_quantity === 0
                              ? "bg-rose-100 text-rose-800"
                              : p.stock_quantity <= 5
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {p.stock_quantity} {p.stock_quantity === 1 ? "unit" : "units"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          defaultValue={p.stock_quantity}
                          key={p.stock_quantity}
                          onBlur={(e) => handleManualSetStock(p, e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(p, 10)}
                            disabled={isUpdating}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-all text-[11px]"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleAdjustStock(p, 25)}
                            disabled={isUpdating}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-all text-[11px]"
                          >
                            +25
                          </button>
                          <button
                            onClick={() => handleAdjustStock(p, 50)}
                            disabled={isUpdating}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-all text-[11px]"
                          >
                            +50
                          </button>
                        </div>
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
