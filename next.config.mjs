import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Definir explicitamente o diretório raiz do projeto
  experimental: {
    outputFileTracingRoot: __dirname,
    outputFileTracingIgnores: ["../app/generated/prisma/**"]
  },
  outputFileTracing: true,
};

export default nextConfig;