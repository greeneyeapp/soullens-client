import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Tüm dil dosyaları
import en from '../locales/en.json';
import tr from '../locales/tr.json';
import zh from '../locales/zh.json';
import hi from '../locales/hi.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';
import pt from '../locales/pt.json';
import ru from '../locales/ru.json';
import id from '../locales/id.json';
import de from '../locales/de.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import tl from '../locales/tl.json';
import it from '../locales/it.json';
import he from '../locales/he.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: Localization.locale.slice(0, 2), // örneğin 'tr-TR' → 'tr'
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      tr: { translation: tr },
      zh: { translation: zh },
      hi: { translation: hi },
      es: { translation: es },
      fr: { translation: fr },
      ar: { translation: ar },
      pt: { translation: pt },
      ru: { translation: ru },
      id: { translation: id },
      de: { translation: de },
      ja: { translation: ja },
      ko: { translation: ko },
      tl: { translation: tl },
      it: { translation: it },
      he: { translation: he },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
