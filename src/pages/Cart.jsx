import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../lib/cartContext";
import { supabase } from "../lib/supabaseClient";
import "../styles/cart.scss";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";

const PAYMENT_OPTIONS = [
  { value: "bizum", label: "Bizum" },
  { value: "transferencia", label: "Transferencia" },
];

const PAYMENT_DETAILS = {
  bizum: {
    title: "Pago por Bizum",
    value: "647080364",
    help: "Envía el importe exacto a este número.",
  },
  transferencia: {
    title: "Pago por transferencia",
    value: "ES0420800371353040007167",
    help: "Haz la transferencia a este IBAN.",
  },
};

const FREE_SHIPPING_THRESHOLD = 60;
const STANDARD_SHIPPING_EUR = 4.95;
const HEAVY_SHIPPING_EUR = 7.95;

function isHeavyShippingItem(item) {
  return Boolean(item?.isHeavyShipping);
}

function getShippingSummary(items, merchandiseTotal) {
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
    qualifiesForFreeShipping,
    hasHeavyItems,
    label: qualifiesForFreeShipping
      ? `Gratis desde ${formatPrice(FREE_SHIPPING_THRESHOLD)}`
      : hasHeavyItems
        ? "Envío ropa de cama pesada"
        : "Envío estándar",
  };
}

function formatPaymentValue(method, value) {
  const normalizedValue = String(value || "").replaceAll(/\s+/g, "");

  if (method === "bizum") {
    return normalizedValue.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  }

  if (method === "transferencia") {
    return normalizedValue.replace(/(.{4})(?=.)/g, "$1 ").trim();
  }

  return value;
}

function formatPrice(value) {
  return `${Number(value || 0).toFixed(2).replace(".", ",")} €`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildReceiptHtml(receipt) {
  const itemsHtml = receipt.items
    .map((item) => {
      const details = [
        item.color ? `Color: ${escapeHtml(item.color)}` : "",
        item.size ? `Talla: ${escapeHtml(item.size)}` : "",
      ]
        .filter(Boolean)
        .join(" · ");

      return `
        <tr>
          <td style="padding:18px 20px;border-bottom:1px solid #ece4de;">
            <strong style="display:block;font-size:14px;line-height:1.45;">${escapeHtml(item.name)}</strong>
            ${details ? `<div style="margin-top:6px;color:#7b6f67;font-size:12px;">${details}</div>` : ""}
          </td>
          <td style="padding:18px 12px;border-bottom:1px solid #ece4de;text-align:center;">${escapeHtml(item.quantity)}</td>
          <td style="padding:18px 20px;border-bottom:1px solid #ece4de;text-align:right;white-space:nowrap;">${escapeHtml(formatPrice(item.unit_price))}</td>
          <td style="padding:18px 20px;border-bottom:1px solid #ece4de;text-align:right;white-space:nowrap;font-weight:700;">${escapeHtml(formatPrice(item.line_total))}</td>
        </tr>
      `;
    })
    .join("");

  const deliveryLines = [
    receipt.delivery.address_line_1,
    receipt.delivery.address_line_2,
    [receipt.delivery.postal_code, receipt.delivery.city].filter(Boolean).join(" "),
    receipt.delivery.province,
  ]
    .filter(Boolean)
    .map((line) => `<div class="address-line">${escapeHtml(line)}</div>`)
    .join("");

  const logoUrl = `${window.location.origin}/images/logo.png`;

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Albarán ${escapeHtml(receipt.reference)}</title>
        <style>
          :root { color-scheme: light; }
          * { box-sizing: border-box; }
          body { margin: 0; background: #f6f0ea; color: #2d2722; font-family: Georgia, "Times New Roman", serif; }
          .page { max-width: 920px; margin: 0 auto; padding: 40px 24px 56px; }
          .sheet { background: #fffdfa; border: 1px solid #eadfd8; border-radius: 28px; overflow: hidden; box-shadow: 0 24px 60px rgba(72, 47, 31, 0.08); }
          .hero { padding: 32px 36px 28px; background: radial-gradient(circle at top right, rgba(212, 180, 148, 0.28), transparent 32%), linear-gradient(135deg, #f8eee6 0%, #fffdfa 55%, #f7f1ec 100%); border-bottom: 1px solid #efe4dc; }
          .brand { display: flex; align-items: center; gap: 16px; margin-bottom: 22px; }
          .brand-logo { width: 78px; height: 78px; object-fit: contain; border-radius: 18px; background: rgba(255,255,255,0.9); padding: 8px; }
          .eyebrow { margin: 0 0 10px; font: 600 11px/1.2 Arial, sans-serif; letter-spacing: 0.16em; text-transform: uppercase; color: #8a6f5a; }
          h1 { margin: 0; font-size: 34px; line-height: 1.05; font-weight: 700; }
          .hero-grid, .grid { display: grid; gap: 18px; }
          .hero-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 22px; gap: 12px; }
          .hero-card, .panel, .totals { border: 1px solid #efe4dc; border-radius: 20px; background: rgba(255, 255, 255, 0.78); }
          .hero-card { padding: 16px 18px; }
          .hero-label, .panel-label { margin: 0 0 8px; font: 600 11px/1.2 Arial, sans-serif; letter-spacing: 0.14em; text-transform: uppercase; color: #8a6f5a; }
          .hero-value { margin: 0; font: 700 15px/1.45 Arial, sans-serif; color: #2d2722; }
          .content { padding: 28px 36px 36px; }
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-bottom: 20px; }
          .panel { padding: 20px 22px; }
          h2 { margin: 0 0 14px; font-size: 18px; line-height: 1.2; }
          .stack { display: grid; gap: 8px; }
          .row { display: grid; gap: 3px; }
          .row strong { font: 600 11px/1.2 Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #8a6f5a; }
          .row span, .address-line, .notes { font: 400 14px/1.55 Arial, sans-serif; color: #3e342d; }
          .notes-wrap { margin-bottom: 20px; }
          .table-wrap { border: 1px solid #efe4dc; border-radius: 22px; overflow: hidden; background: #fff; }
          table { width: 100%; border-collapse: collapse; }
          thead th { padding: 14px 20px; background: #f8f2ee; font: 600 11px/1.2 Arial, sans-serif; letter-spacing: 0.14em; text-transform: uppercase; color: #8a6f5a; }
          tbody td { font: 400 14px/1.45 Arial, sans-serif; color: #3e342d; }
          .totals { width: min(100%, 320px); margin-left: auto; margin-top: 22px; padding: 18px 20px; }
          .total-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; font: 400 14px/1.5 Arial, sans-serif; color: #4a4038; }
          .total-row + .total-row { margin-top: 10px; }
          .grand-total { margin-top: 14px; padding-top: 14px; border-top: 1px solid #efe4dc; font-weight: 700; color: #2d2722; }
          @media print { body { background: #fff; } .page { padding: 0; } .sheet { border: 0; border-radius: 0; box-shadow: none; } }
          @media (max-width: 720px) { .hero, .content { padding-left: 20px; padding-right: 20px; } .hero-grid, .grid { grid-template-columns: 1fr; } }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="sheet">
            <section class="hero">
              <div class="brand">
                <img class="brand-logo" src="${logoUrl}" alt="Bolboretas & Valu" />
                <div>
                  <p class="eyebrow">Bolboretas & Valu</p>
                  <h1>Albarán de pedido</h1>
                </div>
              </div>
              <div class="hero-grid">
                <div class="hero-card"><p class="hero-label">Referencia</p><p class="hero-value">${escapeHtml(receipt.reference)}</p></div>
                <div class="hero-card"><p class="hero-label">Fecha</p><p class="hero-value">${escapeHtml(receipt.created_at)}</p></div>
                <div class="hero-card"><p class="hero-label">Forma de pago</p><p class="hero-value">${escapeHtml(receipt.payment_method_label)}</p></div>
              </div>
            </section>
            <section class="content">
              <div class="grid">
                <section class="panel">
                  <p class="panel-label">Datos del cliente</p>
                  <h2>Cliente</h2>
                  <div class="stack">
                    <div class="row"><strong>Nombre</strong><span>${escapeHtml(receipt.customer.name)}</span></div>
                    <div class="row"><strong>Correo</strong><span>${escapeHtml(receipt.customer.email)}</span></div>
                    <div class="row"><strong>Teléfono</strong><span>${escapeHtml(receipt.customer.phone)}</span></div>
                  </div>
                </section>
                <section class="panel">
                  <p class="panel-label">Entrega</p>
                  <h2>Dirección de entrega</h2>
                  <div class="stack">${deliveryLines || '<div class="address-line">-</div>'}</div>
                </section>
              </div>
              ${
                receipt.notes
                  ? `
                <section class="panel notes-wrap">
                  <p class="panel-label">Indicaciones</p>
                  <h2>Notas del pedido</h2>
                  <p class="notes">${escapeHtml(receipt.notes).replaceAll("\n", "<br/>")}</p>
                </section>
              `
                  : ""
              }
              <section class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style="text-align:left;">Producto</th>
                      <th style="text-align:center;">Cant.</th>
                      <th style="text-align:right;">Precio</th>
                      <th style="text-align:right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
              </section>
              <section class="totals">
                <p class="total-row"><span>Subtotal</span><strong>${escapeHtml(formatPrice(receipt.subtotal))}</strong></p>
                ${
                  Number(receipt.discount_amount || 0) > 0
                    ? `<p class="total-row"><span>Descuento</span><strong>-${escapeHtml(formatPrice(receipt.discount_amount))}</strong></p>`
                    : ""
                }
                <p class="total-row"><span>${escapeHtml(receipt.shipping_label || "Envío")}</span><strong>${Number(receipt.shipping_amount || 0) > 0 ? escapeHtml(formatPrice(receipt.shipping_amount)) : "Gratis"}</strong></p>
                <p class="total-row grand-total"><span>Total</span><strong>${escapeHtml(formatPrice(receipt.total))}</strong></p>
              </section>
            </section>
          </div>
        </div>
      </body>
    </html>
  `;
}

function downloadReceipt(receipt) {
  const html = buildReceiptHtml(receipt);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `albaran-${receipt.reference}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function paymentLabel(value) {
  return PAYMENT_OPTIONS.find((option) => option.value === value)?.label || "No especificado";
}

export default function Cart() {
  const {
    items,
    subtotal,
    discountAmount,
    total,
    appliedDiscount,
    updateQuantity,
    removeItem,
    clearCart,
    applyDiscount,
    clearDiscount,
  } = useCart();

  const [code, setCode] = useState(appliedDiscount?.code || "");
  const [discountMsg, setDiscountMsg] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryAddress2, setDeliveryAddress2] = useState("");
  const [deliveryPostalCode, setDeliveryPostalCode] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryProvince, setDeliveryProvince] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bizum");
  const [orderNotes, setOrderNotes] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReady, setCaptchaReady] = useState(!TURNSTILE_SITE_KEY);
  const [captchaLoadError, setCaptchaLoadError] = useState("");
  const turnstileContainerId = "cart-turnstile";
  const turnstileWidgetIdRef = useRef(null);

  useEffect(() => {
    setCode(appliedDiscount?.code || "");
  }, [appliedDiscount?.code]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return undefined;

    let cancelled = false;
    let loadTimeoutId = null;
    let readinessIntervalId = null;

    function renderTurnstile() {
      if (cancelled || !window.turnstile) return;

      const container = document.getElementById(turnstileContainerId);
      if (!container || container.dataset.rendered === "true") return;

      setCaptchaLoadError("");

      turnstileWidgetIdRef.current = window.turnstile.render(`#${turnstileContainerId}`, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "light",
        callback: (token) => setCaptchaToken(token || ""),
        "expired-callback": () => setCaptchaToken(""),
        "error-callback": () => {
          setCaptchaToken("");
          setCaptchaLoadError(
            "No se pudo cargar la verificación anti-spam. Revisa bloqueadores, extensiones o prueba a recargar."
          );
        },
      });

      container.dataset.rendered = "true";
      setCaptchaReady(true);

      if (loadTimeoutId) {
        window.clearTimeout(loadTimeoutId);
      }
    }

    function handleScriptError() {
      setCaptchaReady(false);
      setCaptchaLoadError(
        "No se pudo cargar la verificación anti-spam. Revisa bloqueadores, extensiones o prueba a recargar."
      );
    }

    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID);

    loadTimeoutId = window.setTimeout(() => {
      if (!window.turnstile) {
        handleScriptError();
      }
    }, 6000);

    readinessIntervalId = window.setInterval(() => {
      if (window.turnstile) {
        renderTurnstile();
      }
    }, 250);

    if (existingScript) {
      if (window.turnstile) {
        renderTurnstile();
      } else {
        existingScript.addEventListener("load", renderTurnstile, { once: true });
        existingScript.addEventListener("error", handleScriptError, { once: true });
      }

      return () => {
        cancelled = true;
        if (loadTimeoutId) {
          window.clearTimeout(loadTimeoutId);
        }
        if (readinessIntervalId) {
          window.clearInterval(readinessIntervalId);
        }
      };
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderTurnstile, { once: true });
    script.addEventListener("error", handleScriptError, { once: true });
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      if (loadTimeoutId) {
        window.clearTimeout(loadTimeoutId);
      }
      if (readinessIntervalId) {
        window.clearInterval(readinessIntervalId);
      }
    };
  }, [turnstileContainerId]);

  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        product_id: item.id,
        variant_id: item.variantId || null,
        name: item.name,
        slug: item.slug,
        color: item.color || "",
        size: item.size || "",
        is_heavy_shipping: Boolean(item.isHeavyShipping),
        category_slug: item.categorySlug || "",
        category_name: item.categoryName || "",
        variant_sku: item.variantSku || "",
        quantity: Number(item.quantity || 0),
        unit_price: Number(item.price || 0),
        line_total: Number(item.price || 0) * Number(item.quantity || 0),
      })),
    [items]
  );

  const merchandiseTotal = useMemo(
    () => Math.max(0, Number((subtotal - discountAmount).toFixed(2))),
    [subtotal, discountAmount]
  );

  const shippingSummary = useMemo(
    () => getShippingSummary(items, merchandiseTotal),
    [items, merchandiseTotal]
  );

  const finalTotal = useMemo(
    () => Number((merchandiseTotal + shippingSummary.shippingAmount).toFixed(2)),
    [merchandiseTotal, shippingSummary.shippingAmount]
  );

  const paymentDetail = PAYMENT_DETAILS[paymentMethod];

  async function handleApplyDiscount(event) {
    event.preventDefault();
    setDiscountMsg("");
    setDiscountError("");

    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      setDiscountError("Introduce un código de descuento.");
      return;
    }

    setCheckingCode(true);

    const { data, error } = await supabase
      .from("shop_discount_codes")
      .select("*")
      .eq("code", normalizedCode)
      .maybeSingle();

    setCheckingCode(false);

    if (error) {
      setDiscountError("No se pudo validar el código ahora mismo.");
      return;
    }

    if (!data) {
      setDiscountError("Ese código no existe.");
      return;
    }

    if (!data.is_active) {
      setDiscountError("Ese código no está activo.");
      return;
    }

    const validFrom = data.valid_from ? new Date(data.valid_from).getTime() : null;
    const validUntil = data.valid_until ? new Date(data.valid_until).getTime() : null;
    const now = Date.now();

    if (validFrom && Number.isFinite(validFrom) && now < validFrom) {
      setDiscountError("Ese código todavía no está disponible.");
      return;
    }

    if (validUntil && Number.isFinite(validUntil) && now > validUntil) {
      setDiscountError("Ese código ya ha caducado.");
      return;
    }

    if (subtotal < Number(data.min_order_amount || 0)) {
      setDiscountError(
        `Este código requiere un pedido mínimo de ${formatPrice(data.min_order_amount || 0)}.`
      );
      return;
    }

    if (
      data.usage_limit &&
      Number(data.usage_limit) > 0 &&
      Number(data.times_used || 0) >= Number(data.usage_limit)
    ) {
      setDiscountError("Ese código ya ha agotado sus usos.");
      return;
    }

    applyDiscount(data);
    setDiscountMsg("Código aplicado correctamente.");
  }

  async function handleSubmitOrder(event) {
    event.preventDefault();
    setOrderError("");
    setOrderSuccess("");

    if (!items.length) {
      setOrderError("Tu carrito está vacío.");
      return;
    }

    if (!acceptedPrivacy) {
      setOrderError("Debes aceptar la política de privacidad para enviar el pedido.");
      return;
    }

    if (!supabase) {
      setOrderError("Supabase no está configurado.");
      return;
    }

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setOrderError("Completa la verificación CAPTCHA antes de enviar el pedido.");
      return;
    }

    const payload = {
      created_at: new Date().toLocaleString("es-ES"),
      customer: {
        name: customerName.trim(),
        email: customerEmail.trim().toLowerCase(),
        phone: customerPhone.trim(),
      },
      delivery: {
        address_line_1: deliveryAddress.trim(),
        address_line_2: deliveryAddress2.trim(),
        postal_code: deliveryPostalCode.trim(),
        city: deliveryCity.trim(),
        province: deliveryProvince.trim(),
      },
      payment_method: paymentMethod,
      notes: orderNotes.trim(),
      items: orderItems,
      subtotal,
      merchandise_total: merchandiseTotal,
      discount_amount: discountAmount,
      shipping_amount: shippingSummary.shippingAmount,
      shipping_label: shippingSummary.label,
      total: finalTotal,
      applied_discount: appliedDiscount
        ? {
            code: appliedDiscount.code,
            description: appliedDiscount.description || "",
            type: appliedDiscount.type,
            value: appliedDiscount.value,
          }
        : null,
      captcha_token: captchaToken,
    };

    setSubmittingOrder(true);

    const { data, error } = await supabase.functions.invoke("submit-order", {
      body: payload,
    });

    setSubmittingOrder(false);

    if (error) {
      setOrderError("No se pudo enviar el pedido. Inténtalo de nuevo.");
      return;
    }

    const finalReference = data?.reference || "";
    const warning = data?.warning || "";

    const receiptSnapshot = {
      reference: finalReference,
      created_at: payload.created_at,
      customer: payload.customer,
      delivery: payload.delivery,
      payment_method: payload.payment_method,
      payment_method_label: paymentLabel(payload.payment_method),
      notes: payload.notes,
      items: orderItems.map((item) => ({
        name: item.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
      })),
      subtotal,
      merchandise_total: merchandiseTotal,
      discount_amount: discountAmount,
      shipping_amount: shippingSummary.shippingAmount,
      shipping_label: shippingSummary.label,
      total: finalTotal,
    };

    clearCart();
    setShowCheckoutForm(false);
    setCode("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setDeliveryAddress("");
    setDeliveryAddress2("");
    setDeliveryPostalCode("");
    setDeliveryCity("");
    setDeliveryProvince("");
    setPaymentMethod("bizum");
    setOrderNotes("");
    setAcceptedPrivacy(false);
    setCaptchaToken("");
    setOrderReference(finalReference);
    setReceiptData(receiptSnapshot);
    setOrderSuccess(
      warning || "Pedido enviado correctamente. Ya puedes descargar el albarán del pedido."
    );

    if (TURNSTILE_SITE_KEY && window.turnstile && turnstileWidgetIdRef.current !== null) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  }

  return (
    <main className="cart-page">
      <div className="cart-page__container">
        <header className="cart-page__header reveal-on-scroll" style={{ "--reveal-delay": "40ms" }}>
          <h1>Carrito</h1>
          <div className="cart-page__headerActions">
            <Link to="/tienda" className="cart-page__continue cart-page__continue--ghost">
              Seguir comprando
            </Link>

            {items.length > 0 ? (
              <button type="button" className="cart-page__clear" onClick={clearCart}>
                Vaciar carrito
              </button>
            ) : null}
          </div>
        </header>

        {items.length === 0 ? (
          <div className="cart-page__empty reveal-on-scroll" style={{ "--reveal-delay": "100ms" }}>
            <p>Tu carrito está vacío.</p>

            {orderSuccess ? (
              <div className="cart-page__orderNotice cart-page__orderNotice--success">
                <p>{orderSuccess}</p>
                {orderReference ? <p>Referencia: {orderReference}</p> : null}

                {receiptData ? (
                  <div className="cart-page__receiptActions">
                    <button type="button" onClick={() => downloadReceipt(receiptData)}>
                      Descargar albarán
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Link to="/tienda" className="cart-page__continue">
              Seguir comprando
            </Link>
          </div>
        ) : (
          <>
            <section className="cart-page__layout">
              <div className="cart-page__list">
                {items.map((item, index) => (
                  <article
                    key={item.lineId || item.id}
                    className="cart-page__item reveal-on-scroll"
                    style={{ "--reveal-delay": `${100 + index * 50}ms` }}
                  >
                    <Link to={`/producto/${item.slug}`} className="cart-page__imageWrap">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : null}
                    </Link>

                    <div className="cart-page__itemBody">
                      <Link to={`/producto/${item.slug}`} className="cart-page__name">
                        {item.name}
                      </Link>

                      {item.color || item.size ? (
                        <p className="cart-page__meta">
                          {item.color ? `Color: ${item.color}` : null}
                          {item.color && item.size ? " · " : null}
                          {item.size ? `Talla: ${item.size}` : null}
                        </p>
                      ) : null}

                      <p className="cart-page__price">{formatPrice(item.price)}</p>

                      <div className="cart-page__controls">
                        <label className="cart-page__qty">
                          <span>Cantidad</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                              updateQuantity(item.lineId || item.id, event.target.value)
                            }
                          />
                        </label>

                        <button
                          type="button"
                          className="cart-page__remove"
                          onClick={() => removeItem(item.lineId || item.id)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>

                    <p className="cart-page__lineTotal">{formatPrice(item.price * item.quantity)}</p>
                  </article>
                ))}
              </div>

              <aside
                className="cart-page__summary reveal-on-scroll"
                style={{ "--reveal-delay": "140ms" }}
              >
                <form className="cart-page__discount" onSubmit={handleApplyDiscount}>
                  <label htmlFor="cart-discount-code" className="cart-page__summaryLabel">
                    Código de descuento
                  </label>

                  <div className="cart-page__discountRow">
                    <input
                      id="cart-discount-code"
                      type="text"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      placeholder="Escribe tu código"
                    />
                    <button type="submit" className="cart-page__discountBtn" disabled={checkingCode}>
                      {checkingCode ? "Comprobando..." : "Aplicar"}
                    </button>
                  </div>

                  {discountError ? (
                    <p className="cart-page__discountMsg cart-page__discountMsg--error">
                      {discountError}
                    </p>
                  ) : null}

                  {discountMsg ? <p className="cart-page__discountMsg">{discountMsg}</p> : null}

                  {appliedDiscount ? (
                    <div className="cart-page__appliedDiscount">
                      <p>
                        <strong>{appliedDiscount.code}</strong>
                        {appliedDiscount.description ? ` · ${appliedDiscount.description}` : ""}
                      </p>
                      <button type="button" onClick={clearDiscount}>
                        Quitar
                      </button>
                    </div>
                  ) : null}
                </form>

                <div className="cart-page__summaryRows">
                  <div className="cart-page__summaryRow">
                    <p className="cart-page__summaryLabel">Subtotal</p>
                    <p className="cart-page__summaryNumber">{formatPrice(subtotal)}</p>
                  </div>

                  {discountAmount > 0 ? (
                    <div className="cart-page__summaryRow cart-page__summaryRow--discount">
                      <p className="cart-page__summaryLabel">Descuento</p>
                      <p className="cart-page__summaryNumber">-{formatPrice(discountAmount)}</p>
                    </div>
                  ) : null}

                  <div className="cart-page__summaryRow">
                    <p className="cart-page__summaryLabel">{shippingSummary.label}</p>
                    <p className="cart-page__summaryNumber">
                      {shippingSummary.shippingAmount > 0
                        ? formatPrice(shippingSummary.shippingAmount)
                        : "Gratis"}
                    </p>
                  </div>
                </div>

                <p className="cart-page__summaryLabel">Total</p>
                <p className="cart-page__summaryValue">{formatPrice(finalTotal)}</p>
                <p className="cart-page__summaryText">
                  Envío gratis a partir de {formatPrice(FREE_SHIPPING_THRESHOLD)}. Completa tus
                  datos para enviar el pedido y recibir el albarán.
                </p>

                <button
                  type="button"
                  className="cart-page__checkoutToggle"
                  onClick={() => setShowCheckoutForm((current) => !current)}
                >
                  {showCheckoutForm ? "Ocultar datos del pedido" : "Finalizar compra"}
                </button>
              </aside>
            </section>

            {showCheckoutForm ? (
              <form className="cart-page__checkoutPanel reveal-on-scroll" onSubmit={handleSubmitOrder}>
                <h2 className="cart-page__orderTitle">Datos del pedido</h2>

                <div className="cart-page__orderForm">
                  <label className="cart-page__field">
                    <span>Nombre y apellidos</span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      required
                    />
                  </label>

                  <label className="cart-page__field">
                    <span>Correo electrónico</span>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                      required
                    />
                  </label>

                  <label className="cart-page__field">
                    <span>Teléfono</span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      required
                    />
                  </label>

                  <label className="cart-page__field cart-page__field--full">
                    <span>Dirección de entrega</span>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(event) => setDeliveryAddress(event.target.value)}
                      required
                    />
                  </label>

                  <label className="cart-page__field cart-page__field--full">
                    <span>Piso, puerta o información adicional</span>
                    <input
                      type="text"
                      value={deliveryAddress2}
                      onChange={(event) => setDeliveryAddress2(event.target.value)}
                    />
                  </label>

                  <label className="cart-page__field">
                    <span>Código postal</span>
                    <input
                      type="text"
                      value={deliveryPostalCode}
                      onChange={(event) => setDeliveryPostalCode(event.target.value)}
                      required
                    />
                  </label>

                  <label className="cart-page__field">
                    <span>Ciudad</span>
                    <input
                      type="text"
                      value={deliveryCity}
                      onChange={(event) => setDeliveryCity(event.target.value)}
                      required
                    />
                  </label>

                  <label className="cart-page__field cart-page__field--full">
                    <span>Provincia</span>
                    <input
                      type="text"
                      value={deliveryProvince}
                      onChange={(event) => setDeliveryProvince(event.target.value)}
                      required
                    />
                  </label>

                  <div className="cart-page__field cart-page__field--full">
                    <span>Forma de pago</span>
                    <div className="cart-page__paymentOptions">
                      {PAYMENT_OPTIONS.map((option) => (
                        <label key={option.value} className="cart-page__paymentOption">
                          <input
                            type="radio"
                            name="payment_method"
                            value={option.value}
                            checked={paymentMethod === option.value}
                            onChange={(event) => setPaymentMethod(event.target.value)}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="cart-page__paymentInfo cart-page__field--full">
                    <p className="cart-page__paymentInfoTitle">{paymentDetail.title}</p>
                    <p className="cart-page__paymentInfoValue">
                      {formatPaymentValue(paymentMethod, paymentDetail.value)}
                    </p>
                    <p className="cart-page__paymentInfoText">{paymentDetail.help}</p>
                    <p className="cart-page__paymentInfoConcept">
                      El concepto del pago se generará al confirmar el pedido.
                    </p>
                  </div>

                  <label className="cart-page__field cart-page__field--full">
                    <span>Notas del pedido</span>
                    <textarea
                      rows="4"
                      value={orderNotes}
                      onChange={(event) => setOrderNotes(event.target.value)}
                      placeholder="Horario de entrega, indicaciones o cualquier detalle útil."
                    />
                  </label>

                  <label className="cart-page__privacy cart-page__field--full">
                    <input
                      type="checkbox"
                      aria-label="Acepto la política de privacidad"
                      checked={acceptedPrivacy}
                      onChange={(event) => setAcceptedPrivacy(event.target.checked)}
                    />
                    <span>
                      He leído y acepto la <Link to="/privacidad">política de privacidad</Link>.
                    </span>
                  </label>

                  {TURNSTILE_SITE_KEY ? (
                    <div className="cart-page__captcha cart-page__field--full">
                      <span>Verificación anti-spam</span>
                      <div id={turnstileContainerId} />
                      {captchaLoadError ? (
                        <p className="cart-page__captchaHelp cart-page__captchaHelp--error">
                          {captchaLoadError}
                        </p>
                      ) : null}
                      {!captchaReady ? (
                        <p className="cart-page__captchaHelp">Cargando verificación...</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {orderError ? (
                  <div className="cart-page__orderNotice cart-page__orderNotice--error">
                    {orderError}
                  </div>
                ) : null}

                {orderSuccess ? (
                  <div className="cart-page__orderNotice cart-page__orderNotice--success">
                    <p>{orderSuccess}</p>
                    {orderReference ? <p>Referencia: {orderReference}</p> : null}
                    {receiptData ? (
                      <div className="cart-page__receiptActions">
                        <button type="button" onClick={() => downloadReceipt(receiptData)}>
                          Descargar albarán
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="cart-page__submitOrder"
                  disabled={
                    submittingOrder ||
                    (Boolean(TURNSTILE_SITE_KEY) && (!captchaReady || Boolean(captchaLoadError)))
                  }
                >
                  {submittingOrder ? "Enviando pedido..." : "Enviar pedido"}
                </button>
              </form>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

