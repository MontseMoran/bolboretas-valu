import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import BackLink from "../components/backLink/BackLink";
import ShopRequestForm from "../components/ShopRequestForm/ShopRequestForm";
import { useCart } from "../lib/cartContext";
import { supabase } from "../lib/supabaseClient";
import "../styles/productDetail.scss";

function buildVariantOptions(variants, field) {
  const grouped = new Map();

  (variants || []).forEach((variant) => {
    const value = String(variant?.[field] || "").trim();

    if (!value) return;

    const current = grouped.get(value);
    grouped.set(value, {
      label: value,
      isAvailable: current ? current.isAvailable || Boolean(variant.is_active) : Boolean(variant.is_active),
    });
  });

  return Array.from(grouped.values());
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!supabase) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("shop_products")
          .select(`
            id,
            slug,
            sku,
            name,
            description,
            price_eur,
            is_pack,
            shop_product_images (
              image_url,
              sort_order
            ),
            shop_product_variants (
              color,
              size,
              is_active
            ),
            shop_product_categories (
              shop_categories (
                id,
                slug,
                name
              )
            )
          `)
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (error) throw error;

        const sortedImages = [...(data.shop_product_images || [])]
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((img) => img.image_url)
          .filter(Boolean);

        const categories = (data.shop_product_categories || [])
          .map((row) => row.shop_categories)
          .filter(Boolean);

        const normalizedProduct = {
          id: data.id,
          slug: data.slug,
          sku: data.sku,
          name: data.name,
          description: data.description || "",
          price: Number(data.price_eur || 0),
          isPack: Boolean(data.is_pack),
          images: sortedImages,
          colors: buildVariantOptions(data.shop_product_variants, "color"),
          sizes: buildVariantOptions(data.shop_product_variants, "size"),
          categoryName: categories[0]?.name || "Sin categoria",
          categories,
        };

        if (!cancelled) {
          setProduct(normalizedProduct);
          setActiveImage(sortedImages[0] || "");
          setQuantity(1);
          setAddedMsg("");
        }
      } catch (error) {
        console.error("Product detail error:", error);
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const hasImages = useMemo(() => product?.images?.length > 0, [product]);

  function handleAddToCart() {
    if (!product) return;

    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.images[0] || "",
      },
      quantity
    );

    setAddedMsg("Añadido al carrito.");
  }

  if (loading) {
    return (
      <main className="product-detail">
        <div className="product-detail__container">
          <p>Cargando producto...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-detail">
        <div className="product-detail__container">
          <p>Producto no encontrado.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="product-detail">
      <div className="product-detail__back">
        <BackLink to="/shop" />
      </div>

      <div className="product-detail__container">
        <section className="product-detail__grid">
          <div className="product-detail__gallery">
            <div className="product-detail__mainImage">
              {activeImage ? (
                <img src={activeImage} alt={product.name} />
              ) : (
                <div className="product-detail__placeholder">Imagen no disponible</div>
              )}
            </div>

            {hasImages && (
              <div className="product-detail__thumbs">
                {product.images.map((image, index) => (
                  <button
                    key={image || index}
                    type="button"
                    className={`product-detail__thumb ${
                      activeImage === image ? "is-active" : ""
                    }`}
                    onClick={() => setActiveImage(image)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail__content">
            <p className="product-detail__category">{product.categoryName}</p>
            <h1>{product.name}</h1>
            <p className="product-detail__price">
              {product.price.toFixed(2).replace(".", ",")} €
            </p>
            <div className="product-detail__purchase">
              <label className="product-detail__quantity">
                <span>Cantidad</span>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => {
                    setQuantity(Math.max(1, Number(event.target.value) || 1));
                    setAddedMsg("");
                  }}
                />
              </label>

              <button
                type="button"
                className="product-detail__addToCart"
                onClick={handleAddToCart}
              >
                Añadir al carrito
              </button>
            </div>
            {addedMsg ? <p className="product-detail__addedMsg">{addedMsg}</p> : null}
            <p className="product-detail__description">{product.description}</p>

            {product.colors.length > 0 ? (
              <div className="product-detail__options">
                <p className="product-detail__optionTitle">Colores</p>
                <div className="product-detail__chips">
                  {product.colors.map((color) => (
                    <span
                      key={color.label}
                      className={`product-detail__chip ${color.isAvailable ? "" : "is-disabled"}`}
                    >
                      {color.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {product.sizes.length > 0 ? (
              <div className="product-detail__options">
                <p className="product-detail__optionTitle">Tallas</p>
                <div className="product-detail__chips">
                  {product.sizes.map((size) => (
                    <span
                      key={size.label}
                      className={`product-detail__chip ${size.isAvailable ? "" : "is-disabled"}`}
                    >
                      {size.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="product-detail__request">
              <ShopRequestForm
                product={product}
                categoryName={product.categoryName}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
