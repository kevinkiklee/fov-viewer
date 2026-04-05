import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'es', 'ja', 'de', 'fr', 'nl', 'ko', 'pt', 'it', 'hi', 'zh', 'tr', 'pl', 'id', 'vi', 'th'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ja: '日本語',
  de: 'Deutsch',
  fr: 'Français',
  nl: 'Nederlands',
  ko: '한국어',
  pt: 'Português',
  it: 'Italiano',
  hi: 'हिन्दी',
  zh: '中文',
  tr: 'Türkçe',
  pl: 'Polski',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  th: 'ไทย',
}

export const localeOpenGraph: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  ja: 'ja_JP',
  de: 'de_DE',
  fr: 'fr_FR',
  nl: 'nl_NL',
  ko: 'ko_KR',
  pt: 'pt_BR',
  it: 'it_IT',
  hi: 'hi_IN',
  zh: 'zh_CN',
  tr: 'tr_TR',
  pl: 'pl_PL',
  id: 'id_ID',
  vi: 'vi_VN',
  th: 'th_TH',
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
})
