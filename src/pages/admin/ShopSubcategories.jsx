import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function ShopSubcategories() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category])),
    [categories]
  );

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [
          { data: subcategoriesData, error: subcategoriesError },
          { data: categoriesData, error: categoriesError },
        ] = await Promise.all([
          supabase
            .from("shop_subcategories")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false }),
          supabase
            .from("shop_categories")
            .select("id, name")
            .order("sort_order", { ascending: true }),
        ]);

        if (subcategoriesError) throw subcategoriesError;
        if (categoriesError) throw categoriesError;

        if (!active) return;
        setItems(subcategoriesData || []);
        setCategories(categoriesData || []);
        setLoadError("");
      } catch (error) {
        console.error(error);
        if (!active) return;
        setItems([]);
        setCategories([]);
        setLoadError(
          'No se pudieron cargar las subcategorias. Falta crear la tabla "shop_subcategories" o sus permisos.'
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(id) {
    if (!confirm("Se borrara la subcategoria.")) {
      return;
    }

    try {
      const { error } = await supabase.from("shop_subcategories").delete().eq("id", id);
      if (error) throw error;
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div>
      <h2>Subcategorias</h2>

      <div className="admin-top-actions">
        <Link to="/admin/subcategorias/nueva" className="admin-action admin-action--primary">
          Nueva subcategoria
        </Link>
      </div>

      {loading ? <p>Cargando...</p> : null}
      {!loading && loadError ? <p>{loadError}</p> : null}
      {!loading && !loadError && items.length === 0 ? <p>No hay subcategorias creadas.</p> : null}

      {!loading && !loadError ? (
        <div className="grid">
          {items.map((item) => (
            <div key={item.id} className="card">
              <h4>{item.name}</h4>
              <p>{item.description || "Sin descripcion."}</p>
              <p>
                <strong>Categoria:</strong> {categoriesById[item.category_id]?.name || "Sin categoria"}
              </p>
              <p>
                <strong>Slug:</strong> {item.slug}
              </p>
              <p>
                <strong>Orden:</strong> {item.sort_order ?? 0}
              </p>
              <p>
                <strong>Estado:</strong> {item.is_active ? "Activa" : "Oculta"}
              </p>

              <div className="actions">
                <Link
                  to={`/admin/subcategorias/${item.id}/editar`}
                  className="admin-action admin-action--edit"
                >
                  Editar
                </Link>

                <button
                  type="button"
                  className="admin-action admin-action--danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
