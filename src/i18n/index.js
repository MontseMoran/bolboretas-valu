import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import esCommon from "./locales/es/common.json";
import catCommon from "./locales/cat/common.json";
import esHome from "./locales/es/home.json";
import catHome from "./locales/cat/home.json";
import esAbout from "./locales/es/about.json";
import catAbout from "./locales/cat/about.json";
import esContact from "./locales/es/contact.json";
import catContact from "./locales/cat/contact.json";
import esAdmin from "./locales/es/admin.json";
import catAdmin from "./locales/cat/admin.json";
import esHelp from "./locales/es/help.json";
import catHelp from "./locales/cat/help.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
 resources: {
  es: {
    common: esCommon,
    home: esHome,
    about: esAbout,
    contact: esContact,
    admin: esAdmin,
    help: esHelp
  },
  cat: {
    common: catCommon,
    home: catHome,
    about: catAbout,
    contact: catContact,
    admin: catAdmin,
     help: catHelp
  },
  ca: {
    common: catCommon,
    home: catHome,
    about: catAbout,
    contact: catContact,
    admin: catAdmin,
    help: catHelp
  },
},
ns: ["common", "home", "about", "contact", "admin", "help"],
defaultNS: "common",

    fallbackLng: "es",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
