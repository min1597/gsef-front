// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Luna Status',
      meta: [

      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' },
        { rel: 'stylesheet', href: '/assets/fontawesome/css/all.min.css' },
        { rel: 'stylesheet', href: '/assets/xeicon/xeicon.min.css' },
        { rel: 'stylesheet', href: '/assets/pretendard/web/static/pretendard.css' }
      ]
    }
  },
  modules: [ '@nuxtjs/tailwindcss' ],
  runtimeConfig: {
    public: {
      apiEndpoint: process.env.API_ENDPOINT,
      build: process.env.BUILD
    }
  },
})
