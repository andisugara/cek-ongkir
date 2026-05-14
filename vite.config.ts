import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rajaOngkirKey = env.VITE_APP_RAJAONGKIR_KEY
  const rajaOngkirUrl = env.VITE_APP_RAJAONGKIR_URL || 'https://rajaongkir.komerce.id/api/v1'
  const telegramBotToken = env.VITE_APP_TELEGRAM_BOT_TOKEN

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api/rajaongkir': {
          target: rajaOngkirUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/rajaongkir/, ''),
          headers: {
            Key: rajaOngkirKey,
          },
        },
        '/api/telegram': {
          target: `https://api.telegram.org/bot${telegramBotToken}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/telegram/, ''),
        },
      },
    },
  }
})
