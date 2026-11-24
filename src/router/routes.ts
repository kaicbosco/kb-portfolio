import type { RouteRecordRaw } from 'vue-router'
import { defaultLocale, supportedLocales, type Locale } from '@/i18n/config'

type Page = 'home' | 'project' | 'notFound'

declare module 'vue-router' {
  interface RouteMeta {
    locale?: Locale
    page?: Page
  }
}

const projectSegments = { pt: 'projetos', en: 'projects' } satisfies Record<Locale, string>

const homePage = () => import('@/pages/HomePage.vue')
const projectPage = () => import('@/pages/ProjectPage.vue')
const notFoundPage = () => import('@/pages/NotFoundPage.vue')

export function localizedRouteName(page: Page, locale: Locale) {
  return `${page}-${locale}` as const
}

function createLocalizedRoutes(locale: Locale): RouteRecordRaw[] {
  return [
    {
      path: `/${locale}`,
      name: localizedRouteName('home', locale),
      component: homePage,
      meta: { locale, page: 'home' },
    },
    {
      path: `/${locale}/${projectSegments[locale]}/:slug`,
      name: localizedRouteName('project', locale),
      component: projectPage,
      props: true,
      meta: { locale, page: 'project' },
    },
    {
      path: `/${locale}/:pathMatch(.*)*`,
      name: localizedRouteName('notFound', locale),
      component: notFoundPage,
      meta: { locale, page: 'notFound' },
    },
  ]
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: ({ query, hash }) => ({
      name: localizedRouteName('home', defaultLocale),
      query,
      hash,
    }),
  },
  ...supportedLocales.flatMap(createLocalizedRoutes),
  {
    path: '/:pathMatch(.*)*',
    component: notFoundPage,
    meta: { locale: defaultLocale, page: 'notFound' },
  },
]
