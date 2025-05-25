// contracheque-app/apps/api/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['cjs'], // CommonJS para Node.js
  dts: true, // Gera arquivos de definição de tipo
  minify: false, // Pode habilitar para produção se desejar
  target: 'es2020', // Ou a versão do Node que você usará
  outDir: 'dist',
});
