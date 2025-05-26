// monorepo-root/apps/web/next.config.ts
import { NextConfig } from 'next'; // Importe o tipo NextConfig se ainda não o fez

const nextConfig: NextConfig = {
  output: 'standalone', // Essencial para Docker otimizado!
};

export default nextConfig;
