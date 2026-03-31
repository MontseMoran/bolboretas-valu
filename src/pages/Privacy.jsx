import React from "react";
import "../styles/privacy.scss";

export default function Privacy() {
  return (
    <main className="container privacy-page">
      <section className="privacy-page__hero reveal-on-scroll" style={{ "--reveal-delay": "60ms" }}>
        <div className="privacy-page__copy">
          <p className="privacy-page__kicker reveal-on-scroll" style={{ "--reveal-delay": "90ms" }}>
            Política de privacidad
          </p>
          <h1 className="privacy-page__title reveal-on-scroll" style={{ "--reveal-delay": "130ms" }}>
            Tratamos tus datos con claridad, cuidado y solo para lo necesario.
          </h1>
          <p className="privacy-page__intro reveal-on-scroll" style={{ "--reveal-delay": "180ms" }}>
            Aquí encontrarás la información básica sobre cómo gestionamos los datos que
            nos envías desde los formularios de la tienda y durante el proceso de pedido.
          </p>
        </div>

        <aside
          className="privacy-page__highlight reveal-on-scroll"
          style={{ "--reveal-delay": "220ms" }}
        >
          <p className="privacy-page__highlightEyebrow">Responsable</p>
          <h2>Bolboretas & Valu</h2>
          <p>
            Puedes escribirnos a{" "}
            <a href="mailto:bolboretasvalu@gmail.com">bolboretasvalu@gmail.com</a> para
            cualquier consulta relacionada con privacidad o tratamiento de datos.
          </p>
        </aside>
      </section>

      <section className="privacy-page__band reveal-on-scroll" style={{ "--reveal-delay": "140ms" }}>
        <div className="privacy-page__bandHeader">
          <p className="privacy-page__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "170ms" }}>
            Finalidad
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "210ms" }}>
            Para qué usamos la información que nos facilitas
          </h2>
        </div>

        <div className="privacy-page__bandContent">
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "250ms" }}>
            Gestionar solicitudes relacionadas con productos, tallas, variantes,
            consultas comerciales y pedidos realizados desde la web.
          </p>
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "300ms" }}>
            En el caso de los pedidos, los datos de contacto y entrega se usan para
            preparar el pedido, emitir la documentación asociada y gestionar el envío.
          </p>
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "350ms" }}>
            El teléfono facilitado podrá incluirse en la documentación de entrega cuando
            resulte necesario para la correcta gestión del transporte.
          </p>
        </div>
      </section>

      <section className="privacy-page__band reveal-on-scroll" style={{ "--reveal-delay": "220ms" }}>
        <div className="privacy-page__bandHeader">
          <p className="privacy-page__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "250ms" }}>
            Base legal
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "290ms" }}>
            El tratamiento se basa en tu consentimiento
          </h2>
        </div>

        <div className="privacy-page__bandContent">
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "330ms" }}>
            La base legal para el tratamiento de los datos es el consentimiento de la
            persona usuaria al enviar el formulario o realizar una solicitud desde la web.
          </p>
        </div>
      </section>

      <section
        className="privacy-page__band privacy-page__band--providers reveal-on-scroll"
        style={{ "--reveal-delay": "300ms" }}
      >
        <div className="privacy-page__bandHeader">
          <p className="privacy-page__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "330ms" }}>
            Destinatarios
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "370ms" }}>
            Qué proveedores pueden intervenir en el servicio
          </h2>
        </div>

        <div className="privacy-page__bandContent">
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "410ms" }}>
            Los datos pueden ser tratados por proveedores tecnológicos necesarios para
            el funcionamiento de la tienda, la gestión de la base de datos y el envío
            de comunicaciones relacionadas con pedidos o consultas.
          </p>
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "460ms" }}>
            También podrán comunicarse a proveedores logísticos o de transporte cuando
            sea necesario para la entrega del pedido.
          </p>
        </div>
      </section>

      <section className="privacy-page__band reveal-on-scroll" style={{ "--reveal-delay": "360ms" }}>
        <div className="privacy-page__bandHeader">
          <p className="privacy-page__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "390ms" }}>
            Conservación
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "430ms" }}>
            Conservamos los datos solo el tiempo necesario
          </h2>
        </div>

        <div className="privacy-page__bandContent">
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "470ms" }}>
            Los datos se conservan durante el tiempo necesario para gestionar la solicitud
            o prestar correctamente el servicio asociado al pedido.
          </p>
        </div>
      </section>

      <section
        className="privacy-page__band privacy-page__band--closing reveal-on-scroll"
        style={{ "--reveal-delay": "420ms" }}
      >
        <div className="privacy-page__bandHeader">
          <p className="privacy-page__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "450ms" }}>
            Derechos
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "490ms" }}>
            Puedes solicitar acceso, rectificación o supresión de tus datos
          </h2>
        </div>

        <div className="privacy-page__bandContent">
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "530ms" }}>
            Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición,
            limitación del tratamiento y portabilidad escribiendo a{" "}
            <a href="mailto:bolboretasvalu@gmail.com">bolboretasvalu@gmail.com</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
