import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import enCommon from "@/locales/en/common.json"
import myCommon from "@/locales/my/common.json"
import thCommon from "@/locales/th/common.json"
import zhCommon from "@/locales/zh/common.json"

export const SUPPORTED_LOCALES = ["en", "my", "th", "zh"] as const
export const UI_LOCALES = ["en", "my"] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      my: { common: myCommon },
      th: { common: thCommon },
      zh: { common: zhCommon },
    },
    fallbackLng: "en",
    supportedLngs: [...SUPPORTED_LOCALES],
    defaultNS: "common",
    ns: ["common"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "relay-locale",
      caches: ["localStorage"],
    },
  })

export { i18n }
