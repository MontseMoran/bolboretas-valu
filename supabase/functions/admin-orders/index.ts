// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireAdmin(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("authorization");

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authHeader) {
    return { error: "Unauthorized", status: 401 };
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const { data: userData, error: userError } = await authClient.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    return { error: "Unauthorized", status: 401 };
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: adminUser, error: adminError } = await serviceClient
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !adminUser) {
    return { error: "Forbidden", status: 403 };
  }

  return { serviceClient };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const auth = await requireAdmin(req);

  if (auth.error) {
    return jsonResponse({ error: auth.error }, auth.status);
  }

  const supabase = auth.serviceClient;

  try {
    const payload = await req.json();
    const action = payload?.action;

    if (action === "list") {
      const { data, error } = await supabase
        .from("shop_orders")
        .select(`
          id,
          reference,
          created_at,
          customer_name,
          email,
          phone,
          payment_method,
          total_eur,
          status
        `)
        .order("created_at", { ascending: false });

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ orders: data || [] });
    }

    if (action === "detail") {
      const orderId = payload?.id;

      if (!orderId) {
        return jsonResponse({ error: "Missing order id" }, 400);
      }

      const [{ data: order, error: orderError }, { data: items, error: itemsError }] =
        await Promise.all([
          supabase
            .from("shop_orders")
            .select("*")
            .eq("id", orderId)
            .single(),
          supabase
            .from("shop_order_items")
            .select(`
              id,
              quantity,
              price_eur,
              product_id,
              variant_id,
              shop_products (
                name,
                slug,
                sku
              ),
              shop_product_variants (
                color,
                size,
                sku
              )
            `)
            .eq("order_id", orderId),
        ]);

      if (orderError) {
        return jsonResponse({ error: orderError.message }, 500);
      }

      if (itemsError) {
        return jsonResponse({ error: itemsError.message }, 500);
      }

      return jsonResponse({
        order,
        items: items || [],
      });
    }

    if (action === "update-status") {
      const orderId = payload?.id;
      const status = payload?.status;

      if (!orderId || !status) {
        return jsonResponse({ error: "Missing order id or status" }, 400);
      }

      const { error } = await supabase
        .from("shop_orders")
        .update({ status })
        .eq("id", orderId);

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (error) {
    return jsonResponse({ error: "Unexpected error", details: String(error) }, 500);
  }
});
