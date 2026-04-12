import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ShopRequestForm from "../components/ShopRequestForm/ShopRequestForm";
import { useCart } from "../lib/cartContext";
import { useSeo } from "../lib/seo";
import { supabase } from "../lib/supabaseClient";

function formatPrice(value) {
  return `${Number(value || 0).toFixed(2).replace(".", ",")} EUR`;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      if (!supabase) {
        if (!active) return;
        setError("Supabase no está configurado.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setAddedMessage("");

        const { data, error: queryError } = await supabase
          .from("shop_products")
          .select(`
            id,
            slug,
            sku,
            name,
            description,
            material,
            price_eur,
            is_heavy_shipping,
            is_active,
            shop_product_images (
              image_url,
              sort_order
            ),
            shop_product_variants (
              id,
              sku,
              color,
              size,
              price_eur,
              sort_order,
              is_active
            ),
            shop_product_categories (
              category_id,
              shop_categories (
                id,
                slug,
                name
              )
            )
          `)
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

        if (queryError) throw queryError;
        if (!data) throw new Error("Producto no encontrado.");

        const images = [...(data.shop_product_images || [])].sort(
          (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
        );
        const variants = [...(data.shop_product_variants || [])]
          .filter((variant) => variant.is_active !== false)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        const categories = (data.shop_product_categories || [])
          .map((row) => row.shop_categories)
          .filter(Boolean);

        if (!active) return;

        setProduct({
          id: data.id,
          slug: data.slug,
          sku: data.sku || "",
          name: data.name || "Producto",
          description: data.description || "",
          material: data.material || "",
          price: Number(data.price_eur || 0),
          isHeavyShipping: Boolean(data.is_heavy_shipping),
          imageUrl: images[0]?.image_url || "",
          images,
          variants,
          categories,
        });
        setSelectedColor(variants[0]?.color || "");
setSelectedSize(variants[0]?.size || "");
      } catch (loadError) {
        console.error("Error al cargar el producto:", loadError);
        if (!active) return;
        setProduct(null);
        setError(loadError.message || "No se pudo cargar el producto.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  const availableColors = useMemo(() => {
  const colors = product?.variants?.map((variant) => variant.color).filter(Boolean) || [];
  return [...new Set(colors)];
}, [product]);

const availableSizes = useMemo(() => {
  const filtered = (product?.variants || []).filter((variant) => {
    if (!selectedColor) return true;
    return variant.color === selectedColor;
  });

  const sizes = filtered.map((variant) => variant.size).filter(Boolean);
  return [...new Set(sizes)];
}, [product, selectedColor]);

const selectedVariant = useMemo(() => {
  return (
    product?.variants?.find((variant) => {
      const colorMatches = selectedColor ? variant.color === selectedColor : true;
      const sizeMatches = selectedSize ? variant.size === selectedSize : true;
      return colorMatches && sizeMatches;
    }) || null
  );
}, [product, selectedColor, selectedSize]);

  useSeo({
    title: product?.name
      ? `${product.name} | Bolboretas & Valu`
      : "Producto | Bolboretas & Valu",
    description:
      product?.description ||
      (product?.name
        ? `Consulta los detalles de ${product.name} en Bolboretas & Valu.`
        : "Consulta el detalle de producto en Bolboretas & Valu."),
    path: slug ? `/producto/${slug}` : "/tienda",
    image: product?.imageUrl || undefined,
  });

  function handleAddToCart() {
    if (!product) return;

    const price = Number(selectedVariant?.price_eur || product.price || 0);
    const color = selectedVariant?.color || "";
    const size = selectedVariant?.size || "";

    addItem({
      id: product.id,
      lineId: selectedVariant ? `${product.id}:${selectedVariant.id}` : product.id,
      slug: product.slug,
      name: product.name,
      price,
      imageUrl: product.imageUrl,
      isHeavyShipping: product.isHeavyShipping,
      color,
      size,
      categorySlug: product.categories?.[0]?.slug || "",
      categoryName: product.categories?.[0]?.name || "",
      variantId: selectedVariant?.id || "",
      variantSku: selectedVariant?.sku || "",
    });

    setAddedMessage("Producto añadido al carrito.");
  }

  if (loading) {
    return <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>Cargando producto...</main>;
  }

  if (error || !product) {
    return (
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
        <p>{error || "Producto no encontrado."}</p>
        <Link to="/tienda">Volver a la tienda</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 56px" }}>
      <div style={{ display: "grid", gap: 24 }}>
        <Link to={product.categories?.[0]?.slug ? `/categoria/${product.categories[0].slug}` : "/tienda"}>
          Volver
        </Link>

        <section
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            alignItems: "start",
          }}
        >
          <div>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: "100%", borderRadius: 18, display: "block", background: "#f6f2ee" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  minHeight: 360,
                  borderRadius: 18,
                  background: "#f6f2ee",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                Imagen pendiente
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <h1 style={{ margin: 0 }}>{product.name}</h1>
              <p style={{ margin: "8px 0 0", fontWeight: 700 }}>
                {formatPrice(selectedVariant?.price_eur || product.price)}
              </p>
            </div>

            {product.description ? <p style={{ margin: 0 }}>{product.description}</p> : null}
            {product.material ? <p style={{ margin: 0 }}><strong>Material:</strong> {product.material}</p> : null}
            
        {availableColors.length > 0 ? (
  <div style={{ display: "grid", gap: 8 }}>
    <span>Color</span>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {availableColors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => {
            setSelectedColor(color);
            setAddedMessage("");
          }}
        style={{
  border: selectedColor === color ? "2px solid #2d2722" : "1px solid #d6d0c8",
  background: selectedColor === color ? "#2d2722" : "#fff",
  color: selectedColor === color ? "#fff" : "#2d2722",
  borderRadius: 999,
  padding: "8px 14px",
  cursor: "pointer",
  fontWeight: 600,
}}
        >
          {color}
        </button>
      ))}
    </div>
  </div>
) : null}

{availableSizes.length > 0 ? (
  <div style={{ display: "grid", gap: 8 }}>
    <span>Talla</span>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {availableSizes.map((size) => (
        <button
          key={size}
          type="button"
          onClick={() => {
            setSelectedSize(size);
            setAddedMessage("");
          }}
          style={{
            color: selectedSize === size ? "#fff" : "#2d2722",
            border: selectedSize === size ? "2px solid #2d2722" : "1px solid #d6d0c8",
            background: selectedSize === size ? "#2d2722" : "#fff",
            borderRadius: 999,
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {size}
        </button>
      ))}
    </div>
  </div>
) : null}

            <button
              type="button"
              onClick={handleAddToCart}
              style={{
                border: 0,
                borderRadius: 999,
                padding: "14px 18px",
                background: "#2d2722",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Añadir al carrito
            </button>

            {addedMessage ? <p style={{ margin: 0 }}>{addedMessage}</p> : null}
          </div>
        </section>

        <ShopRequestForm
          product={{
            id: product.id,
            name: product.name,
            categories: product.categories,
          }}
          categoryName={product.categories?.[0]?.name || ""}
        />
      </div>
    </main>
  );
}
