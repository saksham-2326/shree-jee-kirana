import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { user_id, title, body: msgBody, data = {}, is_broadcast = false } = body;

    if (!title || !msgBody) {
      return new Response(JSON.stringify({ error: "title and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let tokens: string[] = [];

    if (is_broadcast) {
      // Broadcast to all active users with FCM tokens
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("fcm_token")
        .not("fcm_token", "is", null);
      tokens = (profiles || []).map((p: any) => p.fcm_token).filter(Boolean);
    } else if (user_id) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("fcm_token")
        .eq("id", user_id)
        .single();
      if (profile?.fcm_token) {
        tokens.push(profile.fcm_token);
      }
    }

    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");
    let sentCount = 0;

    if (fcmServerKey && tokens.length > 0) {
      for (const token of tokens) {
        try {
          await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `key=${fcmServerKey}`,
            },
            body: JSON.stringify({
              to: token,
              notification: { title, body: msgBody, sound: "default" },
              data: { ...data, click_action: "FLUTTER_NOTIFICATION_CLICK" },
            }),
          });
          sentCount++;
        } catch (e) {
          console.error("FCM send error:", e);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        targeted: tokens.length,
        sent: sentCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
