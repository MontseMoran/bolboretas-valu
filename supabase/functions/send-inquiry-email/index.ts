// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: {
    get: (name: string) => string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type InquiryPayload = {
  mode?: string;
  name?: string;
  email?: string;
  phone?: string;
  amount?: number | null;
  message?: string;
  cat_id?: string | null;
  cat_name?: string | null;
  lang?: string;
  inquiry_id?: string | null;
  created_at?: string | null;
  product_id?: string | null;
  product_name?: string | null;
  category_slug?: string | null;
  requested_item?: string | null;
  requested_size?: string | null;
  notes?: string | null;
  captcha_token?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getModeLabel(mode?: string, lang?: string) {
  const isCat = String(lang || "").toLowerCase().startsWith("cat");
  const normalized = String(mode || "").toLowerCase();

  if (isCat) {
    if (normalized === "adoption") return "adoptar";
    if (normalized === "sponsor") return "amadrinar";
    if (normalized === "member") return "fer-se soci";
    if (normalized === "volunteer") return "fer voluntariat";
    if (normalized === "donation") return "fer una donacio";
    if (normalized === "shop_request") return "demanar un producte de botiga";
    return "enviar una sollicitud";
  }

  if (normalized === "adoption") return "adoptar";
  if (normalized === "sponsor") return "amadrinar";
  if (normalized === "member") return "hacerse socio";
  if (normalized === "volunteer") return "hacer voluntariado";
  if (normalized === "donation") return "hacer una donacion";
  if (normalized === "shop_request") return "pedir un producto de tienda";
  return "enviar una solicitud";
}

async function verifyTurnstileToken(token?: string | null, remoteIp?: string | null) {
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const payload = (await req.json()) as InquiryPayload;
    const forwardedFor = req.headers.get("x-forwarded-for");
    const remoteIp = forwardedFor?.split(",")[0]?.trim() || null;
    const captchaCheck = await verifyTurnstileToken(payload?.captcha_token, remoteIp);

    if (!captchaCheck.ok) {
      return new Response(
        JSON.stringify({ error: captchaCheck.error }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail =
      Deno.env.get("INQUIRY_SENDER_EMAIL") ||
      Deno.env.get("ORDER_SENDER_EMAIL") ||
      "onboarding@resend.dev";
    const recipientsRaw =
      Deno.env.get("INQUIRY_RECIPIENTS") ||
      Deno.env.get("ORDER_RECIPIENTS") ||
      "bolboretasvalu@gmail.com";

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing RESEND_API_KEY secret" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const recipients = recipientsRaw
      .split(",")
      .map((email: string) => email.trim())
      .filter(Boolean);

    if (!recipients.length) {
      return new Response(
        JSON.stringify({ error: "No recipients configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let inquiryId = payload.inquiry_id || null;
    let inquiryCreatedAt = payload.created_at || null;

    if (String(payload.mode || "").toLowerCase() === "shop_request") {
      if (!payload.name || !payload.email || !payload.requested_item) {
        return new Response(
          JSON.stringify({ error: "Missing required shop request fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const shopRequestInsert = {
        product_id: payload.product_id || null,
        product_name: payload.product_name || payload.cat_name || null,
        category_slug: payload.category_slug || null,
        requested_item: payload.requested_item || null,
        requested_size: payload.requested_size || null,
        notes: payload.notes || null,
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
        lang: payload.lang || "es",
      };

      const { data: createdRequest, error: insertError } = await supabase
        .from("shop_requests")
        .insert([shopRequestInsert])
        .select("id, created_at")
        .single();

      if (insertError) {
        return new Response(
          JSON.stringify({ error: insertError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      inquiryId = createdRequest?.id || inquiryId;
      inquiryCreatedAt = createdRequest?.created_at || inquiryCreatedAt;
    }

    const modeLabel = getModeLabel(payload.mode, payload.lang);
    const person = escapeHtml(payload.name || "Una persona");
    const catName = escapeHtml(payload.cat_name || payload.product_name || "un gato");
    const subject = `Bolboretas & Valu: ${person} quiere ${modeLabel}`;

    const html = `
      <h2>Hola Bolboretas & Valu,</h2>
      <p><strong>${person}</strong> quiere <strong>${escapeHtml(modeLabel)}</strong>${payload.cat_name || payload.product_name ? ` a <strong>${catName}</strong>` : ""}.</p>
      <hr />
      <p><strong>Nombre:</strong> ${person}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email || "-")}</p>
      <p><strong>Telefono:</strong> ${escapeHtml(payload.phone || "-")}</p>
      <p><strong>Producto:</strong> ${escapeHtml(payload.product_name || payload.cat_name || "-")}</p>
      ${payload.requested_item ? `<p><strong>Qué necesita:</strong> ${escapeHtml(payload.requested_item)}</p>` : ""}
      ${payload.requested_size ? `<p><strong>Talla:</strong> ${escapeHtml(payload.requested_size)}</p>` : ""}
      ${payload.amount != null ? `<p><strong>Importe:</strong> ${escapeHtml(String(payload.amount))}</p>` : ""}
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(payload.message || payload.notes || "-").replaceAll("\n", "<br/>")}</p>
      ${(inquiryCreatedAt || inquiryId) ? `
        <hr />
        <p style="color:#666;font-size:12px;">
          Referencia interna${inquiryCreatedAt ? ` | Fecha: ${escapeHtml(inquiryCreatedAt)}` : ""}${inquiryId ? ` | ID: ${escapeHtml(inquiryId)}` : ""}
        </p>
      ` : ""}
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
        subject,
        reply_to: payload.email || undefined,
        html,
      }),
    });

    const resendData = await resendResp.json();
    if (!resendResp.ok) {
      return new Response(
        JSON.stringify({ error: "Resend error", details: resendData }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        email_id: resendData?.id || null,
        inquiry_id: inquiryId,
        created_at: inquiryCreatedAt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
