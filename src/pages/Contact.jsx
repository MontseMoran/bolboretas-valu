import React from "react";
import "../styles/contact.scss";

const CONTACT_CHANNELS = [
  {
    title: "WhatsApp",
    handle: "647 080 364",
    href: "https://wa.me/34647080364",
    description: "Escríbenos para consultar tallas, disponibilidad o encargos concretos.",
    icon: "/images/icons/whatsApp.png",
  },
  {
    title: "Email",
    handle: "bolboretasvalu@gmail.com",
    href: "mailto:bolboretasvalu@gmail.com",
    description: "Ideal para consultas detalladas, pedidos especiales o dudas generales.",
    icon: "/images/logo.png",
  },
];

const SOCIAL_NETWORKS = [
  {
    name: "Instagram",
    handle: "@bolboretas_valu",
    href: "https://www.instagram.com/bolboretas_valu/",
    icon: "/images/icons/instagram.png",
  },
  {
    name: "Facebook",
    handle: "Bolboretas & Valu",
    href: "https://www.facebook.com/share/1QA1uKWLWj/",
    icon: "/images/icons/facebook.png",
  },
  {
    name: "TikTok",
    handle: "@cristinabolboretas",
    href: "https://tiktok.com/@cristinabolboretas",
    icon: "/images/icons/tik-tok.png",
  },
  {
    name: "Threads",
    handle: "@bolboretas_valu",
    href: "https://www.threads.com/@bolboretas_valu",
    icon: "/images/icons/treads.png",
  },
];

const CONTACT_STEPS = [
  "Cuéntanos qué prenda, talla, variante o categoría te interesa.",
  "Si lo prefieres, indica también para quién es o qué uso necesitas.",
  "Revisamos disponibilidad y te respondemos por el canal más cómodo para ti.",
];

export default function Contact() {
  return (
    <main className="container contact">
      <section className="contact-hero reveal-on-scroll" style={{ "--reveal-delay": "60ms" }}>
        <div className="contact-copy">
          <p className="contact-kicker reveal-on-scroll" style={{ "--reveal-delay": "90ms" }}>
            Contacto
          </p>
          <h1 className="contact-title reveal-on-scroll" style={{ "--reveal-delay": "130ms" }}>
            Estamos cerca para ayudarte por WhatsApp, email y redes sociales.
          </h1>
          <p className="contact-intro reveal-on-scroll" style={{ "--reveal-delay": "180ms" }}>
            Si estás buscando una talla, una prenda concreta o quieres hacer una consulta
            rápida, puedes escribirnos directamente. Te atendemos de forma cercana y
            personalizada desde Sobrado dos Monxes.
          </p>

          <div className="contact-actions reveal-on-scroll" style={{ "--reveal-delay": "220ms" }}>
            <a
              className="contact-primaryAction"
              href="https://wa.me/34647080364"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir WhatsApp
            </a>
            <a className="contact-secondaryAction" href="mailto:bolboretasvalu@gmail.com">
              Enviar email
            </a>
          </div>
        </div>

        <aside className="contact-highlight reveal-on-scroll" style={{ "--reveal-delay": "260ms" }}>
          <p className="contact-highlight__eyebrow">Atención personalizada</p>
          <h2>Qué puedes consultarnos</h2>
          <ul className="contact-highlight__list">
            <li>Disponibilidad de producto</li>
            <li>Tallas, colores y variantes</li>
            <li>Encargos o peticiones especiales</li>
            <li>Dudas sobre la tienda y pedidos</li>
          </ul>
        </aside>
      </section>

      <section className="contact-band reveal-on-scroll" style={{ "--reveal-delay": "140ms" }}>
        <div className="contact-band__header">
          <p className="contact-band__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "170ms" }}>
            Canales directos
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "210ms" }}>
            Elige cómo prefieres escribirnos
          </h2>
        </div>

        <div className="contact-channelGrid">
          {CONTACT_CHANNELS.map((channel, index) => (
            <a
              key={channel.title}
              className="contact-channelCard reveal-on-scroll"
              style={{ "--reveal-delay": `${250 + index * 50}ms` }}
              href={channel.href}
              target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={channel.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            >
              <span className="contact-channelCard__iconWrap">
                <img src={channel.icon} alt="" className="contact-channelCard__icon" />
              </span>
              <span className="contact-channelCard__meta">
                <span className="contact-channelCard__title">{channel.title}</span>
                <span className="contact-channelCard__handle">{channel.handle}</span>
                <span className="contact-channelCard__description">{channel.description}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="contact-band reveal-on-scroll" style={{ "--reveal-delay": "220ms" }}>
        <div className="contact-band__header">
          <p className="contact-band__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "250ms" }}>
            Redes sociales
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "290ms" }}>
            Síguenos en todas nuestras plataformas
          </h2>
        </div>

        <div className="contact-socialGrid">
          {SOCIAL_NETWORKS.map((network, index) => (
            <a
              key={network.name}
              className="contact-socialCard reveal-on-scroll"
              style={{ "--reveal-delay": `${330 + index * 50}ms` }}
              href={network.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={network.icon} alt="" className="contact-socialCard__icon" />
              <span className="contact-socialCard__name">{network.name}</span>
              <span className="contact-socialCard__handle">{network.handle}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="contact-band contact-band--steps reveal-on-scroll" style={{ "--reveal-delay": "300ms" }}>
        <div className="contact-band__header">
          <p className="contact-band__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "330ms" }}>
            Cómo trabajamos
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "370ms" }}>
            Consultas rápidas y respuesta cercana
          </h2>
        </div>

        <div className="contact-steps">
          {CONTACT_STEPS.map((step, index) => (
            <article
              key={step}
              className="contact-step reveal-on-scroll"
              style={{ "--reveal-delay": `${410 + index * 45}ms` }}
            >
              <span className="contact-step__index">0{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="contact-band contact-band--location reveal-on-scroll"
        style={{ "--reveal-delay": "360ms" }}
      >
        <div className="contact-band__header">
          <p className="contact-band__eyebrow reveal-on-scroll" style={{ "--reveal-delay": "390ms" }}>
            Dónde estamos
          </p>
          <h2 className="reveal-on-scroll" style={{ "--reveal-delay": "430ms" }}>
            También puedes visitarnos en Sobrado dos Monxes
          </h2>
        </div>

        <div className="contact-band__content">
          <p className="reveal-on-scroll" style={{ "--reveal-delay": "470ms" }}>
            Nuestra tienda está a escasos metros del Monasterio de Sobrado dos Monxes,
            Galicia. Si prefieres una atención presencial, estaremos encantadas de recibirte.
          </p>
          <a
            className="contact-locationLink reveal-on-scroll"
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
