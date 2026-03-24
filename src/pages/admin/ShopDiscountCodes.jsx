import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function ShopDiscountCodes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from("shop_discount_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      }

      if (active) {
        setItems(data || []);
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(id) {
    if (!confirm("Se borrará este código de descuento.")) {
      return;
    }

    const { error } = await supabase.from("shop_discount_codes").delete().eq("id", id);

    if (error) {
      alert(error.message || "No se pudo borrar el código.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div>
      <h2>Códigos de descuento</h2>

      <div className="admin-top-actions">
        <Link to="/admin/descuentos/nuevo" className="admin-action admin-action--primary">
          Nuevo descuento
        </Link>
      </div>

      {loading ? <p>Cargando...</p> : null}
      {!loading && items.length === 0 ? <p>No hay códigos creados.</p> : null}

      {!loading ? (
        <div className="grid">
          {items.map((item) => (
            <div key={item.id} className="card">
              <h4>{item.code}</h4>
              <p>{item.description || "Sin descripción."}</p>
              <p>
                <strong>Tipo:</strong>{" "}
                {item.discount_type === "percent" ? "Porcentaje" : "Importe fijo"}
              </p>
              <p>
                <strong>Valor:</strong>{" "}
                {item.discount_type === "percent"
                  ? `${Number(item.discount_value || 0)}%`
                  : `${Number(item.discount_value || 0).toFixed(2)} EUR`}
              </p>
              <p>
                <strong>Pedido mínimo:</strong>{" "}
                {Number(item.min_order_amount || 0).toFixed(2)} EUR
              </p>
              <p>
                <strong>Vigencia:</strong>{" "}
                {item.starts_at || item.ends_at
                  ? `${item.starts_at ? new Date(item.starts_at).toLocaleDateString("es-ES") : "Sin inicio"} - ${
                      item.ends_at ? new Date(item.ends_at).toLocaleDateString("es-ES") : "Sin fin"
                    }`
                  : "Sin fechas"}
              </p>
              <p>
                <strong>Estado:</strong> {item.is_active ? "Activo" : "Inactivo"}
              </p>

              <div className="actions">
                <Link
                  to={`/admin/descuentos/${item.id}/editar`}
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
