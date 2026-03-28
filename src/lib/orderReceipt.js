function formatReceiptPrice(value) {
  return `${Number(value || 0).toFixed(2).replace(".", ",")} €`;
}

function escapeReceiptHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildReceiptHtml(receipt) {
  const itemsHtml = (receipt.items || [])
    .map((item) => {
      const details = [
        item.color ? `Color: ${escapeReceiptHtml(item.color)}` : "",
        item.size ? `Talla: ${escapeReceiptHtml(item.size)}` : "",
      ]
        .filter(Boolean)
        .join(" · ");

      return `
        <tr>
          <td style="padding:18px 20px;border-bottom:1px solid #ece4de;">
            <strong style="display:block;font-size:14px;line-height:1.45;">${escapeReceiptHtml(item.name)}</strong>
            ${details ? `<div style="margin-top:6px;color:#7b6f67;font-size:12px;">${details}</div>` : ""}
          </td>
          <td style="padding:18px 12px;border-bottom:1px solid #ece4de;text-align:center;">${escapeReceiptHtml(item.quantity)}</td>
          <td style="padding:18px 20px;border-bottom:1px solid #ece4de;text-align:right;white-space:nowrap;">${escapeReceiptHtml(formatReceiptPrice(item.unit_price))}</td>
          <td style="padding:18px 20px;border-bottom:1px solid #ece4de;text-align:right;white-space:nowrap;font-weight:700;">${escapeReceiptHtml(formatReceiptPrice(item.line_total))}</td>
        </tr>
      `;
    })
    .join("");

  const delivery = receipt.delivery || {};
  const deliveryLines = [
    delivery.address_line_1,
    delivery.address_line_2,
    [delivery.postal_code, delivery.city].filter(Boolean).join(" "),
    delivery.province,
  ]
    .filter(Boolean)
    .map((line) => `<div class="address-line">${escapeReceiptHtml(line)}</div>`)
    .join("");

  const customer = receipt.customer || {};
  const logoUrl = `${window.location.origin}/images/logo.png`;

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Albarán ${escapeReceiptHtml(receipt.reference)}</title>
        <style>
          :root { color-scheme: light; }
          * { box-sizing: border-box; }
          body { margin: 0; background: #f7f5f2; color: #2d2722; font-family: Inter, Arial, sans-serif; }
          .page { max-width: 920px; margin: 0 auto; padding: 28px 18px 40px; }
          .sheet { background: #fff; border: 1px solid rgba(45, 39, 34, 0.08); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(45, 39, 34, 0.06); }
          .hero { padding: 28px 30px 24px; border-bottom: 1px solid rgba(45, 39, 34, 0.08); }
          .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
          .brand-logo { width: 58px; height: 58px; object-fit: contain; }
          .eyebrow { margin: 0 0 4px; font-size: 18px; line-height: 1.1; letter-spacing: 0.04em; font-weight: 700; color: #2d2722; }
          h1 { margin: 0; font-size: 20px; line-height: 1.1; font-weight: 600; color: rgba(45, 39, 34, 0.74); }
          .hero-grid, .grid { display: grid; gap: 14px; }
          .hero-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .hero-card, .panel, .totals { border: 1px solid rgba(45, 39, 34, 0.08); border-radius: 16px; background: #fff; }
          .hero-card { padding: 14px 16px; }
          .hero-label, .panel-label { margin: 0 0 6px; font-size: 11px; line-height: 1.2; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(45, 39, 34, 0.56); }
          .hero-value { margin: 0; font-size: 15px; line-height: 1.45; font-weight: 700; color: #2d2722; }
          .content { padding: 24px 30px 30px; }
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-bottom: 18px; }
          .panel { padding: 18px; }
          h2 { margin: 0 0 12px; font-size: 17px; line-height: 1.2; }
          .stack { display: grid; gap: 8px; }
          .row { display: grid; gap: 3px; }
          .row strong { font-size: 11px; line-height: 1.2; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(45, 39, 34, 0.56); }
          .row span, .address-line, .notes { font-size: 14px; line-height: 1.55; color: #3e342d; }
          .notes-wrap { margin-bottom: 18px; }
          .table-wrap { border: 1px solid rgba(45, 39, 34, 0.08); border-radius: 16px; overflow: hidden; background: #fff; }
          table { width: 100%; border-collapse: collapse; }
          thead th { padding: 12px 16px; background: #f7f5f2; font-size: 11px; line-height: 1.2; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(45, 39, 34, 0.56); }
          tbody td { font-size: 14px; line-height: 1.45; color: #3e342d; }
          .totals { width: min(100%, 320px); margin-left: auto; margin-top: 18px; padding: 16px 18px; }
          .total-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; font-size: 14px; line-height: 1.5; color: #4a4038; }
          .total-row + .total-row { margin-top: 8px; }
          .grand-total { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(45, 39, 34, 0.08); font-weight: 700; color: #2d2722; }
          .footer-wrap { margin-top: 22px; padding-top: 18px; }
          .footer-line {
            width: 100%;
            height: 1px;
            border: 0;
            margin: 0 0 14px;
            background: linear-gradient(90deg, rgba(45, 39, 34, 0), rgba(45, 39, 34, 0.22), rgba(45, 39, 34, 0));
          }
          .footer-note {
            margin: 0;
            text-align: center;
            font-size: 15px;
            line-height: 1.45;
            font-weight: 600;
            letter-spacing: 0.01em;
            color: rgba(45, 39, 34, 0.78);
          }
          @media print { body { background: #fff; } .page { padding: 0; } .sheet { border: 0; border-radius: 0; box-shadow: none; } }
          @media (max-width: 720px) { .hero, .content { padding-left: 18px; padding-right: 18px; } .hero-grid, .grid { grid-template-columns: 1fr; } }
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
                <div class="hero-card"><p class="hero-label">Referencia</p><p class="hero-value">${escapeReceiptHtml(receipt.reference)}</p></div>
                <div class="hero-card"><p class="hero-label">Fecha</p><p class="hero-value">${escapeReceiptHtml(receipt.created_at)}</p></div>
                <div class="hero-card"><p class="hero-label">Forma de pago</p><p class="hero-value">${escapeReceiptHtml(receipt.payment_method_label)}</p></div>
              </div>
            </section>
            <section class="content">
              <div class="grid">
                <section class="panel">
                  <p class="panel-label">Datos del cliente</p>
                  <h2>Cliente</h2>
                  <div class="stack">
                    <div class="row"><strong>Nombre</strong><span>${escapeReceiptHtml(customer.name)}</span></div>
                    <div class="row"><strong>Correo</strong><span>${escapeReceiptHtml(customer.email)}</span></div>
                    <div class="row"><strong>Teléfono</strong><span>${escapeReceiptHtml(customer.phone)}</span></div>
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
                  <p class="notes">${escapeReceiptHtml(receipt.notes).replaceAll("\n", "<br/>")}</p>
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
                <p class="total-row"><span>Subtotal</span><strong>${escapeReceiptHtml(formatReceiptPrice(receipt.subtotal))}</strong></p>
                ${
                  Number(receipt.discount_amount || 0) > 0
                    ? `<p class="total-row"><span>Descuento</span><strong>-${escapeReceiptHtml(formatReceiptPrice(receipt.discount_amount))}</strong></p>`
                    : ""
                }
                <p class="total-row"><span>${escapeReceiptHtml(receipt.shipping_label || "Envío")}</span><strong>${Number(receipt.shipping_amount || 0) > 0 ? escapeReceiptHtml(formatReceiptPrice(receipt.shipping_amount)) : "Gratis"}</strong></p>
                <p class="total-row grand-total"><span>Total</span><strong>${escapeReceiptHtml(formatReceiptPrice(receipt.total))}</strong></p>
              </section>
              <div class="footer-wrap">
                <hr class="footer-line" />
                <p class="footer-note">Gracias por apoyar al comercio local 🦋</p>
              </div>
            </section>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function downloadReceipt(receipt) {
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

export function printReceipt(receipt) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");

  const cleanup = () => {
    window.setTimeout(() => {
      iframe.remove();
    }, 1000);
  };

  iframe.onload = () => {
    const iframeWindow = iframe.contentWindow;

    if (!iframeWindow) {
      cleanup();
      return;
    }

    iframeWindow.focus();
    window.setTimeout(() => {
      iframeWindow.print();
      cleanup();
    }, 150);
  };

  document.body.appendChild(iframe);

  const iframeDocument = iframe.contentDocument;

  if (!iframeDocument) {
    cleanup();
    return;
  }

  iframeDocument.open();
  iframeDocument.write(buildReceiptHtml(receipt));
  iframeDocument.close();
}
