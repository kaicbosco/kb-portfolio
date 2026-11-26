export const supportedLocales = ['pt', 'en'] as const
export type Locale = (typeof supportedLocales)[number]

export const defaultLocale = 'pt' satisfies Locale

export const localeDetails = {
  pt: { languageTag: 'pt-BR', label: 'Português (Brasil)', shortLabel: 'PT' },
  en: { languageTag: 'en', label: 'English', shortLabel: 'EN' },
} as const
