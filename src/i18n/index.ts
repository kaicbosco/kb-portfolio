import { createI18n } from 'vue-i18n'
import { defaultLocale, localeDetails } from './config'
import en from './locales/en'
import ptBR from './locales/pt-BR'

export function createPortfolioI18n() {
  return createI18n({
    legacy: false,
    locale: localeDetails[defaultLocale].languageTag,
    fallbackLocale: localeDetails[defaultLocale].languageTag,
    messages: {
      'pt-BR': ptBR,
      en,
    },
  })
}
