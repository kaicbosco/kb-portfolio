import type ptBR from './pt-BR'

const en = {
  layout: {
    skipToContent: 'Skip to content',
    languages: 'Languages',
    primaryNavigation: 'Main navigation',
    home: 'Home',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    copyright: '© {year} {name}',
  },
  pages: {
    home: {
      description: 'Kaíque Bosco’s portfolio is under development.',
    },
    project: {
      title: 'Project',
      description: 'The case study is not available yet.',
      identifier: 'Identifier:',
    },
    notFound: {
      title: 'Page not found',
      description: 'This address does not match a portfolio page.',
      backToHome: 'Back to home',
    },
  },
} satisfies typeof ptBR

export default en
