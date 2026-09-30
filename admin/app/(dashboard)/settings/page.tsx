"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { StoreSettings } from "@/lib/types";
import { Settings, Save, CheckCircle2, AlertCircle, RefreshCw, Power } from "lucide-react";

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("store_settings")
        .select("*")
        .limit(1)
        .single();

      if (err) throw err;
      if (data) setSettings(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load store settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const { error: err } = await supabase
        .from("store_settings")
        .update({
          store_name: settings.store_name,
          store_phone: settings.store_phone,
          store_address: settings.store_address,
          upi_vpa: settings.upi_vpa,
          upi_merchant_name: settings.upi_merchant_name,
          cod_enabled: settings.cod_enabled,
          pay_at_store_enabled: settings.pay_at_store_enabled,
          min_order_amount: Number(settings.min_order_amount),
          delivery_fee: Number(settings.delivery_fee),
          free_delivery_threshold: Number(settings.free_delivery_threshold),
          is_store_open: settings.is_store_open,
        })
        .eq("id", settings.id);

      if (err) throw err;
      setMessage("Store settings saved successfully!");
    } catch (e: any) {
      setError(e.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-500 text-xs">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 text-sm">No settings record found. Run seed script.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Operations & Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Configure UPI payment VPA, delivery rules, minimum order size, and store operating hours
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Store Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Store Profile & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Phone / Helpline</label>
              <input
                type="text"
                required
                value={settings.store_phone}
                onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Physical Store Address</label>
              <input
                type="text"
                required
                value={settings.store_address}
                onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* UPI Payments Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">UPI Payment Settings (No Razorpay)</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Indian UPI credentials used for customer intent deep links (Google Pay, PhonePe, Paytm, BHIM)
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200">
              UPI Intent Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Merchant UPI ID (VPA) *
              </label>
              <input
                type="text"
                required
                value={settings.upi_vpa}
                onChange={(e) => setSettings({ ...settings, upi_vpa: e.target.value })}
                placeholder="shreejeekirana@upi"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">Payments from GPay/PhonePe will be credited directly to this VPA.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Merchant Registered Name *</label>
              <input
                type="text"
                required
                value={settings.upi_merchant_name}
                onChange={(e) => setSettings({ ...settings, upi_merchant_name: e.target.value })}
                placeholder="Shree Jee Kirana"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Ordering Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Delivery & Cart Threshold Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Minimum Order Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={settings.min_order_amount}
                onChange={(e) => setSettings({ ...settings, min_order_amount: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Customers cannot checkout below this subtotal.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={settings.delivery_fee}
                onChange={(e) => setSettings({ ...settings, delivery_fee: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Free Delivery Above (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={settings.free_delivery_threshold}
                onChange={(e) => setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Optional Payment Methods & Store Open Switch */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Payment Options & Store Availability
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="cod_enabled"
                checked={settings.cod_enabled}
                onChange={(e) => setSettings({ ...settings, cod_enabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="cod_enabled" className="font-semibold text-slate-700">
                Enable Cash on Delivery (COD) for customers
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="pay_at_store_enabled"
                checked={settings.pay_at_store_enabled}
                onChange={(e) => setSettings({ ...settings, pay_at_store_enabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="pay_at_store_enabled" className="font-semibold text-slate-700">
                Enable "Pay & Collect at Store" (Self-pickup)
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                id="store_open_flag"
                checked={settings.is_store_open}
                onChange={(e) => setSettings({ ...settings, is_store_open: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="store_open_flag" className="font-bold text-slate-900">
                Store is currently OPEN (Accepting new customer orders)
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-60 text-xs"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Store Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
