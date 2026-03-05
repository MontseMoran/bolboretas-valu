import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail = Deno.env.get("INQUIRY_SENDER_EMAIL") || "onboarding@resend.dev";
    const recipientsRaw = Deno.env.get("INQUIRY_RECIPIENTS") ||
      "websosmaullidos@gmail.com,m-moran@hotmail.es";

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

    const subjectMode = payload.mode ? ` (${payload.mode})` : "";
    const subject = `Nuevo formulario SOS Maullidos${subjectMode}`;

    const html = `
      <h2>Nuevo formulario recibido</h2>
      <p><strong>ID:</strong> ${escapeHtml(payload.inquiry_id || "-")}</p>
      <p><strong>Fecha:</strong> ${escapeHtml(payload.created_at || "-")}</p>
      <p><strong>Modo:</strong> ${escapeHtml(payload.mode || "-")}</p>
      <p><strong>Idioma:</strong> ${escapeHtml(payload.lang || "-")}</p>
      <hr />
      <p><strong>Nombre:</strong> ${escapeHtml(payload.name || "-")}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email || "-")}</p>
      <p><strong>Teléfono:</strong> ${escapeHtml(payload.phone || "-")}</p>
      <p><strong>Importe:</strong> ${escapeHtml(String(payload.amount ?? "-"))}</p>
      <p><strong>Gato ID:</strong> ${escapeHtml(payload.cat_id || "-")}</p>
      <p><strong>Gato:</strong> ${escapeHtml(payload.cat_name || "-")}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(payload.message || "-").replaceAll("\n", "<br/>")}</p>
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
      JSON.stringify({ ok: true, email_id: resendData?.id || null }),
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
