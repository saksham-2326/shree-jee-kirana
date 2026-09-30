"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bell, Send, CheckCircle2, AlertCircle, RefreshCw, MessageSquare } from "lucide-react";

interface SentNotification {
  id: string;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
}

export default function NotificationsAdminPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<SentNotification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, created_at, is_read")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      if (data) setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setSending(true);

    try {
      if (!title.trim() || !body.trim()) {
        throw new Error("Title and message body are required.");
      }

      // 1. Fetch all customer user IDs
      const { data: customers, error: cErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer");

      if (cErr) throw cErr;

      const userIds = (customers || []).map((c) => c.id);

      // 2. Insert notifications in database for all customers
      if (userIds.length > 0) {
        const notificationsData = userIds.map((uid) => ({
          user_id: uid,
          title: title.trim(),
          body: body.trim(),
          data: { type: "store_announcement" },
        }));

        const { error: nErr } = await supabase.from("notifications").insert(notificationsData);
        if (nErr) throw nErr;
      }

      // 3. Trigger FCM push notification via Supabase Edge Function if deployed
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-push-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            body: body.trim(),
            is_broadcast: true,
          }),
        });
      } catch (fcmErr) {
        // FCM edge function call is best effort if not yet deployed to cloud
        console.warn("FCM push function call:", fcmErr);
      }

      setSuccessMsg(`Broadcast sent to ${userIds.length} customers successfully!`);
      setTitle("");
      setBody("");
      fetchHistory();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to broadcast notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Broadcast & Notifications</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Send instant push notifications and offers to all registered customers
        </p>
      </div>

      {/* Compose Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          <span>New Customer Broadcast</span>
        </h2>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Notification Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Festival Special! 10% OFF on Whole Wheat Atta"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notification Message *</label>
            <textarea
              rows={3}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="e.g. Stock up for Diwali with fresh chakki atta, pure cow ghee, and delicious sweets at Shree Jee Kirana..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-60 text-xs"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Announcement...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast to All Customers</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Notifications Sent */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Recent Store Notification Records</span>
          </h2>
          <button
            onClick={fetchHistory}
            disabled={loadingHistory}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No notifications sent yet.</div>
          ) : (
            history.map((n) => (
              <div key={n.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{n.title}</h3>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{n.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
