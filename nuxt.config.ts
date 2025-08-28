import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app/',
  compatibilityDate: '2025-07-15',
  pages: true,
  ssr: false,
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  components: true,
  css: ['@/assets/scss/main.scss'],
  // runtimeConfig: {
  //   apiSecret: process.env.API_SECRET, // 只在 server 可用
  //   public: {
  //     apiBase: process.env.API_BASE // server + client 可用
  //   }
  // },
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error : 請參考 vuetify 官網
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  devServer: {
    port: 3000
  }
})