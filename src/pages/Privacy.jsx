import React from "react";
import "../styles/privacy.scss";

export default function Privacy() {
  return (
    <main className="privacy">
      <div className="privacy__container">
        <h1 className="privacy__title">Política de privacidad</h1>
        <p className="privacy__intro">
          Información básica sobre cómo tratamos los datos que envías desde los
          formularios de la tienda.
        </p>

        <section className="privacy__section">
          <h2>Responsable</h2>
          <p>Bolboretas & Valu</p>
          <p>
            Email:{" "}
            <a href="mailto:bolboretasvalu@gmail.com">bolboretasvalu@gmail.com</a>
          </p>
        </section>

        <section className="privacy__section">
          <h2>Finalidad</h2>
          <p>
            Gestionar solicitudes relacionadas con productos, tallas, variantes,
            consultas comerciales y pedidos realizados desde la web.
          </p>
          <p>
            En el caso de los pedidos, los datos de contacto y entrega se usan para
            preparar el pedido, emitir la documentación asociada y gestionar el envío.
            El teléfono facilitado podrá incluirse en la documentación de entrega
            cuando resulte necesario para la correcta gestión del transporte.
          </p>
        </section>

        <section className="privacy__section">
          <h2>Base legal</h2>
          <p>Consentimiento de la persona usuaria al enviar el formulario.</p>
        </section>

        <section className="privacy__section">
          <h2>Destinatarios</h2>
          <p>
            Los datos pueden ser tratados por proveedores necesarios para el servicio,
            como Supabase para infraestructura y base de datos, y Resend para el envío
            de correos electrónicos. También podrán comunicarse a proveedores logísticos
            o de transporte cuando sea necesario para la entrega del pedido.
          </p>
        </section>

        <section className="privacy__section">
          <h2>Conservación</h2>
          <p>Los datos se conservan durante el tiempo necesario para gestionar la solicitud.</p>
        </section>

        <section className="privacy__section">
          <h2>Derechos</h2>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión,
            oposición, limitación del tratamiento y portabilidad escribiendo a{" "}
            <a href="mailto:bolboretasvalu@gmail.com">bolboretasvalu@gmail.com</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
