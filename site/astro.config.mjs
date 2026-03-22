import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://gio-hernandez-saito.github.io',
  base: '/zerovoids-idea-bank',
  trailingSlash: 'always',
  integrations: [react()],
});
