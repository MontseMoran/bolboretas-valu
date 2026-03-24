import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

function getFriendlyErrorMessage(error) {
  const message = String(error?.message || "");

  if (message.includes("shop_discount_codes_code_key")) {
    return "Ya existe un código de descuento con ese nombre.";
  }

  return message || "No se pudo guardar el descuento.";
}

export default function ShopDiscountCodeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = useMemo(() => Boolean(id), [id]);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "percent",
    discount_value: 0,
    min_order_amount: 0,
    starts_at: "",
    ends_at: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!isEdit) return;

      const { data, error } = await supabase
        .from("shop_discount_codes")
        .select("*")
        .eq("id", id)
        .single();

      if (!active) return;

      if (error) {
        alert(getFriendlyErrorMessage(error));
      } else if (data) {
        setForm({
          code: data.code || "",
          description: data.description || "",
          discount_type: data.discount_type || "percent",
          discount_value: data.discount_value ?? 0,
          min_order_amount: data.min_order_amount ?? 0,
          starts_at: data.starts_at ? String(data.starts_at).slice(0, 16) : "",
          ends_at: data.ends_at ? String(data.ends_at).slice(0, 16) : "",
          is_active: data.is_active ?? true,
        });
      }

      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value || 0),
      min_order_amount: Number(form.min_order_amount || 0),
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      is_active: form.is_active,
    };

    const query = isEdit
      ? supabase.from("shop_discount_codes").update(payload).eq("id", id)
      : supabase.from("shop_discount_codes").insert([payload]);

    const { error } = await query;
    setSaving(false);

    if (error) {
      alert(getFriendlyErrorMessage(error));
      return;
    }

    navigate("/admin/descuentos");
  }

  return (
    <div className="admin-form">
      <h2>{isEdit ? "Editar descuento" : "Nuevo descuento"}</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <form className="admin-form__grid" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code">Código</label>
            <input
              id="code"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="VERANO10"
              required
            />
          </div>

          <div>
            <label htmlFor="discount_type">Tipo de descuento</label>
            <select
              id="discount_type"
              name="discount_type"
              value={form.discount_type}
              onChange={handleChange}
            >
              <option value="percent">Porcentaje</option>
              <option value="fixed">Importe fijo</option>
            </select>
          </div>

          <div>
            <label htmlFor="discount_value">
              Valor {form.discount_type === "percent" ? "(%)" : "(EUR)"}
            </label>
            <input
              id="discount_value"
              name="discount_value"
              type="number"
              min="0"
              step={form.discount_type === "percent" ? "1" : "0.01"}
              value={form.discount_value}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="min_order_amount">Pedido mínimo</label>
            <input
              id="min_order_amount"
              name="min_order_amount"
              type="number"
              min="0"
              step="0.01"
              value={form.min_order_amount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="starts_at">Inicio</label>
            <input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              value={form.starts_at}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="ends_at">Fin</label>
            <input
              id="ends_at"
              name="ends_at"
              type="datetime-local"
              value={form.ends_at}
              onChange={handleChange}
            />
          </div>

          <div className="checkbox full">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              Descuento activo en la tienda
            </label>
          </div>

          <div className="full">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="10% en artículos seleccionados"
            />
          </div>

          <button type="submit" className="admin-btn-primary" disabled={saving}>
            {saving ? "Guardando..." : "Guardar descuento"}
          </button>
        </form>
      )}
    </div>
  );
}
