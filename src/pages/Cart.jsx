import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../lib/cartContext";
import "../styles/cart.scss";

export default function Cart() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <main className="cart-page">
      <div className="cart-page__container">
        <header className="cart-page__header">
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
          <div className="cart-page__empty">
            <p>Tu carrito está vacío.</p>
            <Link to="/tienda" className="cart-page__continue">
              Seguir comprando
            </Link>
          </div>
        ) : (
          <section className="cart-page__layout">
            <div className="cart-page__list">
              {items.map((item) => (
                <article key={item.lineId || item.id} className="cart-page__item">
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
                    <p className="cart-page__price">
                      {item.price.toFixed(2).replace(".", ",")} €
                    </p>

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

                  <p className="cart-page__lineTotal">
                    {(item.price * item.quantity).toFixed(2).replace(".", ",")} €
                  </p>
                </article>
              ))}
            </div>

            <aside className="cart-page__summary">
              <p className="cart-page__summaryLabel">Total</p>
              <p className="cart-page__summaryValue">
                {total.toFixed(2).replace(".", ",")} €
              </p>
              <p className="cart-page__summaryText">
                La compra online todavía no está finalizada. Usa este carrito como
                preparación del pedido.
              </p>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
