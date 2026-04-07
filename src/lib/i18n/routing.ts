import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'es', 'ja', 'de', 'fr', 'nl', 'ko', 'pt', 'it', 'hi', 'zh', 'tr', 'pl', 'id', 'vi', 'th', 'ru', 'bn', 'zh-TW', 'uk', 'sv', 'da', 'nb', 'fi', 'cs', 'ro', 'hu', 'el', 'ms', 'fil', 'ca'] as const
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
  ru: 'Русский',
  bn: 'বাংলা',
  'zh-TW': '繁體中文',
  uk: 'Українська',
  sv: 'Svenska',
  da: 'Dansk',
  nb: 'Norsk bokmål',
  fi: 'Suomi',
  cs: 'Čeština',
  ro: 'Română',
  hu: 'Magyar',
  el: 'Ελληνικά',
  ms: 'Bahasa Melayu',
  fil: 'Filipino',
  ca: 'Català',
}

/**
 * Country flag emoji per locale, used in the language switcher.
 *
 * Disambiguation choices:
 * - en → 🇺🇸 (matches en_US OG locale; site is .io)
 * - pt → 🇧🇷 (matches pt_BR OG locale; Brazil dominates pt speakers ~95%)
 * - bn → 🇧🇩 Bangladesh (the Bengali nation, despite OG using bn_IN for SEO)
 * - uk → 🇺🇦 Ukraine, NOT 🇬🇧 (the locale code "uk" means Ukrainian)
 * - zh-TW → 🇹🇼 Taiwan, NOT 🇨🇳
 * - ca → 🇦🇩 Andorra (only sovereign nation where Catalan is sole official;
 *   using 🇪🇸 would conflict visually with `es` Spanish)
 * - cs → 🇨🇿 Czech Republic
 * - el → 🇬🇷 Greece
 * - nb → 🇳🇴 Norway
 * - hi → 🇮🇳 India
 */
export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  ja: '🇯🇵',
  de: '🇩🇪',
  fr: '🇫🇷',
  nl: '🇳🇱',
  ko: '🇰🇷',
  pt: '🇧🇷',
  it: '🇮🇹',
  hi: '🇮🇳',
  zh: '🇨🇳',
  tr: '🇹🇷',
  pl: '🇵🇱',
  id: '🇮🇩',
  vi: '🇻🇳',
  th: '🇹🇭',
  ru: '🇷🇺',
  bn: '🇧🇩',
  'zh-TW': '🇹🇼',
  uk: '🇺🇦',
  sv: '🇸🇪',
  da: '🇩🇰',
  nb: '🇳🇴',
  fi: '🇫🇮',
  cs: '🇨🇿',
  ro: '🇷🇴',
  hu: '🇭🇺',
  el: '🇬🇷',
  ms: '🇲🇾',
  fil: '🇵🇭',
  ca: '🇦🇩',
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
  ru: 'ru_RU',
  bn: 'bn_IN',
  'zh-TW': 'zh_TW',
  uk: 'uk_UA',
  sv: 'sv_SE',
  da: 'da_DK',
  nb: 'nb_NO',
  fi: 'fi_FI',
  cs: 'cs_CZ',
  ro: 'ro_RO',
  hu: 'hu_HU',
  el: 'el_GR',
  ms: 'ms_MY',
  fil: 'fil_PH',
  ca: 'ca_ES',
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
})
