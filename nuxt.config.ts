export default defineNuxtConfig({
  compatibilityDate: '2026-10-15',
  devtools: { enabled: true },

  runtimeConfig: {
    // Server side only. Anything NOT under `public` never reaches the browser,
    // which is where the API key has to stay (NFR-SEC-02): a key shipped in a
    // page's JavaScript is a key anyone can read.
    apiBase: process.env.FMEP_API_BASE || 'http://localhost:8000',
    apiKey: process.env.FMEP_API_KEY || '',

    public: {
      // Safe to expose: display settings, not secrets.
      marketLabels: {
        total_corners: 'Corners',
        total_cards: 'Cards',
        total_fouls: 'Fouls',
      },
    },
  },

  app: {
    head: {
      title: 'Football micro-event forecasts',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Corner, card and foul forecasts with their measured accuracy.' },
      ],
    },
  },
})
