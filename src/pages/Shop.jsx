import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/shop.scss";

export default function Shop() {
  const { t } = useTranslation();

  return (
    <main className="shop">
      <div className="shop__container">

        <header className="shop__header">
          <h1 className="shop__title">
            {t("shop_title")}
          </h1>
          <p className="shop__intro">
            {t("shop_intro")}
          </p>
        </header>

        <section className="shop__block">
          <h2 className="shop__blockTitle">
            {t("shop_amazon_title")}
          </h2>

          <p className="shop__text">
            {t("shop_amazon_text")}
          </p>

          <a
            href="https://www.amazon.es/hz/wishlist/ls/1EXW0OQXB7M6B?ref_=wl_share"
            target="_blank"
            rel="noreferrer"
            className="shop__pillLink"
          >
            {t("shop_amazon_cta")}
          </a>
        </section>

        <section className="shop__block">
          <h2 className="shop__blockTitle">
            {t("shop_gos_title")}
          </h2>

          <p className="shop__text">
            {t("shop_gos_text")}
          </p>

          <a
            href="https://www.gosigatalimentacio.org/ca/39-sos-maullidos"
            target="_blank"
            rel="noreferrer"
            className="shop__pillLink"
          >
            {t("shop_gos_cta")}
          </a>
        </section>

        <section className="shop__block">
          <h2 className="shop__blockTitle">
            {t("shop_other_title")}
          </h2>

          <p className="shop__text">
            {t("shop_other_text")}
          </p>
        </section>

      </div>
    </main>
  );
}