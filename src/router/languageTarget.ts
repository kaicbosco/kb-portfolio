import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import type { Locale } from '@/i18n/config'
import { localizedRouteName } from './routes'

export function languageTarget(
  route: RouteLocationNormalizedLoaded,
  locale: Locale,
): RouteLocationRaw {
  const { slug } = route.params

  if (route.meta.page === 'project' && typeof slug === 'string') {
    return {
      name: localizedRouteName('project', locale),
      params: { slug },
      query: route.query,
      hash: route.hash,
    }
  }

  return {
    name: localizedRouteName('home', locale),
    ...(route.meta.page === 'home' && { query: route.query, hash: route.hash }),
  }
}
