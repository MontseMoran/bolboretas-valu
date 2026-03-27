// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value?: number | null) {
  return `${Number(value || 0).toFixed(2).replace(".", ",")} EUR`;
}

function paymentLabel(value?: string) {
  if (value === "bizum") return "Bizum";
  if (value === "transferencia") return "Transferencia";
  return "No especificado";
}

const FREE_SHIPPING_THRESHOLD = 60;
const STANDARD_SHIPPING_EUR = 4.95;
const HEAVY_SHIPPING_EUR = 7.95;

function isHeavyShippingItem(item?: Record<string, unknown>) {
  return Boolean(item?.is_heavy_shipping);
}

function getShippingSummary(items: Array<Record<string, unknown>>, merchandiseTotal: number) {
  const normalizedMerchandiseTotal = Number(merchandiseTotal || 0);
  const qualifiesForFreeShipping = normalizedMerchandiseTotal >= FREE_SHIPPING_THRESHOLD;
  const hasHeavyItems = items.some((item) => isHeavyShippingItem(item));
  const shippingAmount = qualifiesForFreeShipping
    ? 0
    : hasHeavyItems
      ? HEAVY_SHIPPING_EUR
      : STANDARD_SHIPPING_EUR;

  return {
    shippingAmount,
    label: qualifiesForFreeShipping
      ? `Gratis desde ${formatPrice(FREE_SHIPPING_THRESHOLD)}`
      : hasHeavyItems
        ? "Envío ropa de cama pesada"
        : "Envío estándar",
  };
}

async function verifyTurnstileToken(token?: string, remoteIp?: string | null) {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");

  if (!secret) {
    return { ok: true, enabled: false };
  }

  if (!token) {
    return { ok: false, enabled: true, error: "Missing CAPTCHA token" };
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);

  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return { ok: false, enabled: true, error: "CAPTCHA verification failed" };
  }

  const data = await response.json();

  if (!data?.success) {
    return { ok: false, enabled: true, error: "Invalid CAPTCHA token" };
  }

  return { ok: true, enabled: true };
}

async function buildSequentialReference(supabase: ReturnType<typeof createClient>) {
  const year = new Date().getFullYear();
  const prefix = `BV-${year}-`;

  const { data: latestOrder, error } = await supabase
    .from("shop_orders")
    .select("reference")
    .ilike("reference", `${prefix}%`)
    .order("reference", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const lastNumber = latestOrder?.reference
    ? Number(String(latestOrder.reference).replace(prefix, ""))
    : 0;

  const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    const items = Array.isArray(payload?.items) ? payload.items : [];
    const forwardedFor = req.headers.get("x-forwarded-for");
    const remoteIp = forwardedFor?.split(",")[0]?.trim() || null;

    const captchaCheck = await verifyTurnstileToken(payload?.captcha_token, remoteIp);

    if (!captchaCheck.ok) {
      return new Response(JSON.stringify({ error: captchaCheck.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!payload?.customer?.name || !payload?.customer?.email || !payload?.customer?.phone) {
      return new Response(JSON.stringify({ error: "Missing customer data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      !payload?.delivery?.address_line_1 ||
      !payload?.delivery?.postal_code ||
      !payload?.delivery?.city ||
      !payload?.delivery?.province
    ) {
      return new Response(JSON.stringify({ error: "Missing delivery data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!items.length) {
      return new Response(JSON.stringify({ error: "Missing order items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subtotal = Number(payload.subtotal || 0);
    const discountAmount = Number(payload.discount_amount || 0);
    const merchandiseTotal = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
    const shippingSummary = getShippingSummary(items, merchandiseTotal);
    const finalTotal = Number((merchandiseTotal + shippingSummary.shippingAmount).toFixed(2));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let discountId = null;

    if (payload.applied_discount?.code) {
      const { data: discount, error: discountError } = await supabase
        .from("shop_discount_codes")
        .select("id, code, is_active, valid_from, valid_until, min_order_amount, usage_limit, times_used")
        .eq("code", payload.applied_discount.code)
        .maybeSingle();

      if (discountError) {
        return new Response(JSON.stringify({ error: discountError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!discount || !discount.is_active) {
        return new Response(JSON.stringify({ error: "Discount code is not active" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const now = Date.now();
      const validFrom = discount.valid_from ? new Date(discount.valid_from).getTime() : null;
      const validUntil = discount.valid_until ? new Date(discount.valid_until).getTime() : null;
      const minOrderAmount = Number(discount.min_order_amount || 0);

      if (validFrom && Number.isFinite(validFrom) && now < validFrom) {
        return new Response(JSON.stringify({ error: "Discount code not available yet" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (validUntil && Number.isFinite(validUntil) && now > validUntil) {
        return new Response(JSON.stringify({ error: "Discount code expired" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (Number(payload.subtotal || 0) < minOrderAmount) {
        return new Response(JSON.stringify({ error: "Minimum order amount not met" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (
        discount.usage_limit &&
        Number(discount.usage_limit) > 0 &&
        Number(discount.times_used || 0) >= Number(discount.usage_limit)
      ) {
        return new Response(JSON.stringify({ error: "Discount code exhausted" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      discountId = discount.id;
    }

    const orderReference = await buildSequentialReference(supabase);

    const orderInsert = {
      customer_name: payload.customer.name,
      email: payload.customer.email,
      phone: payload.customer.phone,
      payment_method: payload.payment_method,
      total_eur: finalTotal,
      reference: orderReference,
      address_line_1: payload.delivery.address_line_1,
      address_line_2: payload.delivery.address_line_2 || null,
      postal_code: payload.delivery.postal_code,
      city: payload.delivery.city,
      province: payload.delivery.province,
      notes: payload.notes || null,
      subtotal_eur: subtotal,
      discount_eur: discountAmount,
      discount_code: payload.applied_discount?.code || null,
      status: "pendiente",
    };

    const { data: createdOrder, error: orderError } = await supabase
      .from("shop_orders")
      .insert([orderInsert])
      .select("id, reference")
      .single();

    if (orderError) {
      return new Response(JSON.stringify({ error: orderError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderItems = items.map((item) => ({
      order_id: createdOrder.id,
      product_id: item.product_id || null,
      variant_id: item.variant_id || null,
      quantity: Number(item.quantity || 0),
      price_eur: Number(item.unit_price || 0),
    }));

    const { error: itemsError } = await supabase
      .from("shop_order_items")
      .insert(orderItems);

    if (itemsError) {
      await supabase.from("shop_orders").delete().eq("id", createdOrder.id);

      return new Response(JSON.stringify({ error: itemsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (discountId) {
      const { error: discountUpdateError } = await supabase.rpc("increment_discount_times_used", {
        discount_id: discountId,
      });

      if (discountUpdateError) {
        const { data: currentDiscount } = await supabase
          .from("shop_discount_codes")
          .select("times_used")
          .eq("id", discountId)
          .single();

        const nextTimesUsed = Number(currentDiscount?.times_used || 0) + 1;

        const { error: fallbackDiscountError } = await supabase
          .from("shop_discount_codes")
          .update({ times_used: nextTimesUsed })
          .eq("id", discountId);

        if (fallbackDiscountError) {
          return new Response(JSON.stringify({ error: fallbackDiscountError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail =
      Deno.env.get("ORDER_SENDER_EMAIL") ||
      Deno.env.get("INQUIRY_SENDER_EMAIL") ||
      "onboarding@resend.dev";
    const recipientsRaw =
      Deno.env.get("ORDER_RECIPIENTS") ||
      Deno.env.get("INQUIRY_RECIPIENTS") ||
      "bolboretasvalu@gmail.com";

    let emailWarning = null;

    if (resendApiKey) {
      const recipients = recipientsRaw
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);

      const itemRows = items
        .map((item) => {
          const details = [
            item.color ? `Color: ${escapeHtml(String(item.color))}` : "",
            item.size ? `Talla: ${escapeHtml(String(item.size))}` : "",
            item.variant_sku ? `SKU variante: ${escapeHtml(String(item.variant_sku))}` : "",
          ]
            .filter(Boolean)
            .join(" · ");

          return `
            <tr>
              <td style="padding:10px 8px;border-bottom:1px solid #ece7e4;">
                <strong>${escapeHtml(item.name || "-")}</strong>
                ${details ? `<div style="color:#666;font-size:12px;margin-top:4px;">${details}</div>` : ""}
              </td>
              <td style="padding:10px 8px;border-bottom:1px solid #ece7e4;text-align:center;">${escapeHtml(String(item.quantity || 0))}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #ece7e4;text-align:right;">${escapeHtml(formatPrice(item.unit_price))}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #ece7e4;text-align:right;">${escapeHtml(formatPrice(item.line_total))}</td>
            </tr>
          `;
        })
        .join("");

      const deliveryLines = [
        payload.delivery.address_line_1 || "",
        payload.delivery.address_line_2 || "",
        [payload.delivery.postal_code || "", payload.delivery.city || ""].filter(Boolean).join(" "),
        payload.delivery.province || "",
      ]
        .filter(Boolean)
        .map((line) => `<div>${escapeHtml(line)}</div>`)
        .join("");

      const discountBlock = payload.applied_discount
        ? `
          <p><strong>Cupón aplicado:</strong> ${escapeHtml(payload.applied_discount.code || "-")}</p>
          ${payload.applied_discount.description ? `<p><strong>Descripción:</strong> ${escapeHtml(payload.applied_discount.description)}</p>` : ""}
        `
        : "";

      const html = `
        <h2>Nuevo pedido recibido</h2>
        <p><strong>Referencia:</strong> ${escapeHtml(createdOrder.reference || orderReference)}</p>
        <p><strong>Fecha:</strong> ${escapeHtml(payload.created_at || new Date().toISOString())}</p>
        <hr />
        <h3>Cliente</h3>
        <p><strong>Nombre:</strong> ${escapeHtml(payload.customer.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.customer.email)}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(payload.customer.phone)}</p>
        <hr />
        <h3>Entrega</h3>
        ${deliveryLines || "<p>-</p>"}
        <p><strong>Forma de pago:</strong> ${escapeHtml(paymentLabel(payload.payment_method))}</p>
        ${payload.notes ? `<p><strong>Notas:</strong><br/>${escapeHtml(payload.notes).replaceAll("\n", "<br/>")}</p>` : ""}
        <hr />
        <h3>Albarán</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:10px 8px;text-align:left;border-bottom:1px solid #d8cfca;">Producto</th>
              <th style="padding:10px 8px;text-align:center;border-bottom:1px solid #d8cfca;">Cant.</th>
              <th style="padding:10px 8px;text-align:right;border-bottom:1px solid #d8cfca;">Precio</th>
              <th style="padding:10px 8px;text-align:right;border-bottom:1px solid #d8cfca;">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="margin-top:16px;">
          <p><strong>Subtotal:</strong> ${escapeHtml(formatPrice(payload.subtotal))}</p>
          ${Number(payload.discount_amount || 0) > 0 ? `<p><strong>Descuento:</strong> -${escapeHtml(formatPrice(payload.discount_amount))}</p>` : ""}
          ${discountBlock}
          <p><strong>${escapeHtml(shippingSummary.label)}:</strong> ${shippingSummary.shippingAmount > 0 ? escapeHtml(formatPrice(shippingSummary.shippingAmount)) : "Gratis"}</p>
          <p style="font-size:18px;"><strong>Total pedido:</strong> ${escapeHtml(formatPrice(finalTotal))}</p>
        </div>
      `;

      const resendResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: senderEmail,
          to: recipients,
          subject: `Bolboretas & Valu: nuevo pedido ${escapeHtml(createdOrder.reference || orderReference)}`,
          reply_to: payload.customer.email || undefined,
          html,
        }),
      });

      if (!resendResp.ok) {
        emailWarning = "Pedido guardado, pero no se pudo enviar el correo del albarán.";
      }
    } else {
      emailWarning = "Pedido guardado, pero falta RESEND_API_KEY para enviar el albarán.";
    }

    return new Response(
      JSON.stringify({
        ok: true,
        order_id: createdOrder.id,
        reference: createdOrder.reference || orderReference,
        warning: emailWarning,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
