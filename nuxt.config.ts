// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      title: '실시간 순위 확인 시스템 - 경기체육교육 진로진학 페스티벌',
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
