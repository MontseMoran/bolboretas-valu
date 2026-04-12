import { useEffect } from "react";

const DEFAULT_TITLE = "Bolboretas & Valu | Tienda online de ropa y complementos";
const DEFAULT_DESCRIPTION =
  "Bolboretas & Valu: tienda online de ropa, complementos y textil hogar con colecciones para mujer, hombre, infantil y hogar.";
const DEFAULT_IMAGE = "https://www.bolboretasvalu.com/logo-whatsApp.png";
const SITE_NAME = "Bolboretas & Valu";
const SITE_URL = "https://www.bolboretasvalu.com";

function upsertMeta(selector, attributes) {
  let node = document.head.querySelector(selector);

  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
}

function upsertLink(selector, attributes) {
  let node = document.head.querySelector(selector);

  if (!node) {
    node = document.createElement("link");
    document.head.appendChild(node);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
}

export function useSeo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_IMAGE,
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
}) {
  useEffect(() => {
    const canonicalUrl = new URL(path || "/", SITE_URL).toString();

    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: SITE_NAME,
    });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });
  }, [description, image, path, robots, title]);
}

