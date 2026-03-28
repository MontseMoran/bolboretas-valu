import React from "react";
import "../styles/about.scss";

export default function About() {
  return (
    <main className="container about">
      <section className="about-hero reveal-on-scroll" style={{ "--reveal-delay": "60ms" }}>
        <div className="about-copy">
          <p className="about-kicker reveal-on-scroll" style={{ "--reveal-delay": "90ms" }}>
            Bolboretas & Valu
          </p>
          <h1 className="about-title reveal-on-scroll" style={{ "--reveal-delay": "130ms" }}>
            Comercio local con historia, cercanía y dedicación.
          </h1>
          <p className="about-intro reveal-on-scroll" style={{ "--reveal-delay": "180ms" }}>
            Soy Cristina García y estoy al frente de esta tienda en Sobrado dos Monxes, un
            comercio local con más de 25 años de historia, situado a escasos metros del
            Monasterio de Sobrado dos Monxes, Galicia.
          </p>
        </div>

        <figure className="about-portrait reveal-on-scroll" style={{ "--reveal-delay": "220ms" }}>
          <img
            src="/images/cris.png"
            alt="Cristina, al frente de Bolboretas & Valu"
            className="about-image"
          />
          <figcaption className="about-caption reveal-on-scroll" style={{ "--reveal-delay": "260ms" }}>
            Una tienda de proximidad construida con ilusión, compromiso y cariño.
          </figcaption>
        </figure>
      </section>

      <section className="about-band reveal-on-scroll" style={{ "--reveal-delay": "140ms" }}>
        <div className="about-band__header">
          <p className="about-band__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "170ms" }}>
            Nuestra historia
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "210ms" }}>
            Una nueva etapa con raíces
          </h2>
        </div>
        <div className="about-band__content">
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "250ms" }}>
            En febrero de 2021, en plena pandemia, Ángeles, su anterior propietaria, me
            confió este negocio con una generosidad que nunca olvidaré, casi como si me lo
            entregara siendo ya parte de su familia.
          </p>
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "300ms" }}>
            Aquel gesto marcó el comienzo de una nueva etapa que sigo construyendo cada día
            con la misma ilusión, compromiso y cariño.
          </p>
        </div>
      </section>

      <section className="about-band reveal-on-scroll" style={{ "--reveal-delay": "220ms" }}>
        <div className="about-band__header">
          <p className="about-band__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "250ms" }}>
            Qué encontrarás aquí
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "290ms" }}>
            Moda y hogar seleccionados con criterio
          </h2>
        </div>
        <div className="about-band__content">
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "330ms" }}>
            Desde aquí trabajamos para ofrecer moda para mujer y hombre, ropa
            infantil-juvenil, de bebé y artículos para el hogar, cuidando cada detalle y
            apostando por algo que considero fundamental: el valor del comercio local.
          </p>
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "380ms" }}>
            Porque comprar en el comercio local no es solo comprar. Es apoyar a personas,
            a historias reales y a pequeños negocios que forman parte de la vida del
            pueblo.
          </p>
        </div>
      </section>

      <section
        className="about-band about-band--closing reveal-on-scroll"
        style={{ "--reveal-delay": "300ms" }}
      >
        <div className="about-band__header">
          <p className="about-band__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "330ms" }}>
            Gracias
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "370ms" }}>
            Seguir cerca también es una forma de cuidar
          </h2>
        </div>
        <div className="about-band__content">
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "410ms" }}>
            En un momento en el que las grandes superficies lo ocupan casi todo, seguir
            apostando por el comercio de proximidad es más importante que nunca.
          </p>
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "460ms" }}>
            Gracias por acompañarnos en este camino y por apoyar el comercio local.
          </p>
        </div>
      </section>

      <section
        className="about-band about-band--location reveal-on-scroll"
        style={{ "--reveal-delay": "360ms" }}
      >
        <div className="about-band__header">
          <p className="about-band__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "390ms" }}>
            Dónde estamos
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "430ms" }}>
            Visítanos en Sobrado dos Monxes
          </h2>
        </div>
        <div className="about-band__content">
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "470ms" }}>
            Nuestra tienda está en Sobrado dos Monxes, Galicia, a escasos metros del
            Monasterio de Sobrado dos Monxes.
          </p>
          <a
            className="about-locationLink reveal-on-scroll"
            style={{ "--reveal-delay": "520ms" }}
            href="https://www.google.com/maps/search/?api=1&query=Bolboretas%20%26%20Valu%20Sobrado%20dos%20Monxes"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cómo llegar
          </a>
        </div>
      </section>
    </main>
  );
}
