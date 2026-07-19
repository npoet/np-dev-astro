import { defineThemeConfig } from './types'

export default defineThemeConfig({
  site: 'https://npoet.dev',
  title: 'npoet.dev',
  description: 'A minimal Astro blog theme',
  author: 'npoet',
  navbarItems: [
    { label: 'About', href: '/about/' }
  ],
  footerItems: [
    {
      icon: 'tabler--brand-github',
      href: 'https://github.com/npoet',
      label: 'Github'
    },
    {
     icon: 'tabler--file-cv',
     href: '/resume.pdf',
     label: 'Download résumé',
     download: true
    }
  ],

  locale: 'en',
  mode: 'dark',
  modeToggle: true,
  colorScheme: 'scheme-mono',
  openGraphImage: undefined,
  postsPerPage: 5,
  postsView: 'list',
  projectsPerPage: 3,
  projectsView: 'list',
  scrollProgress: false,
  scrollToTop: true,
  tagIcons: {
    tailwindcss: 'tabler--brand-tailwind',
    astro: 'tabler--brand-astro',
    documentation: 'tabler--book'
  },
  expressiveCodeThemes: ['vitesse-light', 'vitesse-black']
})
