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
      title: '{name} — Frontend Developer',
      hero: {
        availability: 'Open to work opportunities',
        eyebrow: '01 / INTRODUCTION',
        role: 'Frontend Developer',
        education: 'Software Engineering Student',
        description:
          'I build web applications focused on frontend architecture, reusable interfaces, and software quality. I turn complex requirements into functional, well-structured digital experiences.',
        github: 'View GitHub',
        linkedin: 'Connect on LinkedIn',
        motion: {
          enabled: 'Pause animations',
          paused: 'Enable animations',
          reduced: 'Animations disabled by system preference',
          unavailable: 'Animations unavailable',
        },
        highlights: {
          label: 'Professional highlights',
          focus: {
            category: 'FOCUS',
            value: 'Frontend Development',
            description: 'Architecture & Interfaces',
          },
          stack: {
            category: 'PRIMARY STACK',
            value: 'Vue · TypeScript',
            description: 'Modern Web Ecosystem',
          },
          education: {
            category: 'EDUCATION',
            value: 'Software Engineering',
            description: 'Undergraduate Student',
          },
          work: {
            category: 'WORK MODEL',
            value: 'Remote',
            description: 'Open to Global Opportunities',
          },
        },
      },
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
