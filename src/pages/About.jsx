import React from "react";
import "../styles/about.scss";

export default function About() {
  return (
    <main className="container about">
      <section className="about-hero reveal-on-scroll" style={{ "--reveal-delay": "60ms" }}>
        <div className="about-copy">
          <p className="about-kicker">Bolboretas & Valu</p>
          <h1 className="about-title">Comercio local con historia, cercanía y dedicación.</h1>
          <p className="about-intro">
            Soy Cristina y estoy al frente de esta tienda en Sobrado dos Monxes, un
            comercio local con más de 25 años de historia, situado a escasos metros del
            Monasterio de Sobrado dos Monxes.
          </p>
        </div>

        <figure className="about-portrait">
          <img
            src="/images/cris.png"
            alt="Cristina, al frente de Bolboretas & Valu"
            className="about-image"
          />
          <figcaption className="about-caption">
            Una tienda de proximidad construida con ilusión, compromiso y cariño.
          </figcaption>
        </figure>
      </section>

      <section className="about-band reveal-on-scroll" style={{ "--reveal-delay": "140ms" }}>
        <div className="about-band__header">
          <p className="about-band__eyebrow">Nuestra historia</p>
          <h2>Una nueva etapa con raíces</h2>
        </div>
        <div className="about-band__content">
          <p>
            En febrero de 2021, en plena pandemia, Ángeles, su anterior propietaria, me
            confió este negocio con una generosidad que nunca olvidaré, casi como si me lo
            entregara siendo ya parte de su familia.
          </p>
          <p>
            Aquel gesto marcó el comienzo de una nueva etapa que sigo construyendo cada día
            con la misma ilusión, compromiso y cariño.
          </p>
        </div>
      </section>

      <section className="about-band reveal-on-scroll" style={{ "--reveal-delay": "220ms" }}>
        <div className="about-band__header">
          <p className="about-band__eyebrow">Qué encontrarás aquí</p>
          <h2>Moda y hogar seleccionados con criterio</h2>
        </div>
        <div className="about-band__content">
          <p>
            Desde aquí trabajamos para ofrecer moda para mujer y hombre, ropa
            infantil-juvenil, de bebé y artículos para el hogar, cuidando cada detalle y
            apostando por algo que considero fundamental: el valor del comercio local.
          </p>
          <p>
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
          <p className="about-band__eyebrow">Gracias</p>
          <h2>Seguir cerca también es una forma de cuidar</h2>
        </div>
        <div className="about-band__content">
          <p>
            En un momento en el que las grandes superficies lo ocupan casi todo, seguir
            apostando por el comercio de proximidad es más importante que nunca.
          </p>
          <p>
            Gracias por acompañarnos en este camino y por apoyar el comercio local.
          </p>
        </div>
      </section>
    </main>
  );
}
