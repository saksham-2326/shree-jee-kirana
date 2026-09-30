"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LogOut, User, Power, RefreshCw } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [adminName, setAdminName] = useState<string>("Store Admin");
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);
  const [togglingStore, setTogglingStore] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      // Get current user
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", authData.user.id)
          .single();
        if (profile?.full_name) {
          setAdminName(profile.full_name);
        }
      }

      // Get store settings
      const { data: settings } = await supabase
        .from("store_settings")
        .select("is_store_open")
        .limit(1)
        .single();
      if (settings) {
        setIsStoreOpen(settings.is_store_open);
      }
    }

    loadData();
  }, []);

  const handleToggleStore = async () => {
    try {
      setTogglingStore(true);
      const newStatus = !isStoreOpen;
      const { error } = await supabase
        .from("store_settings")
        .update({ is_store_open: newStatus })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (!error) {
        setIsStoreOpen(newStatus);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingStore(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Store Status Indicator */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggleStore}
          disabled={togglingStore}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isStoreOpen
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
              : "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
          }`}
          title="Click to toggle store open/closed for customer orders"
        >
          {togglingStore ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Power className="w-3.5 h-3.5" />
          )}
          <span>Store Status: {isStoreOpen ? "OPEN FOR ORDERS" : "STORE CLOSED"}</span>
        </button>
      </div>

      {/* Right: Admin Profile & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-200">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{adminName}</p>
            <p className="text-[11px] text-slate-500 font-medium">Administrator</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Log out of Admin Portal"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
