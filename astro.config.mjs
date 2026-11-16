// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH || '/',
  integrations: [{
    name: 'local-weather-test',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command !== 'dev') return;
        injectRoute({
          pattern: '/weather-test',
          entrypoint: new URL('./src/features/information/weather/WeatherPreview.astro', import.meta.url),
        });
      },
    },
  }],
});
