// contracheque-app/apps/api/src/config/env.ts
import 'dotenv/config'; // Carrega .env para process.env
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1), // Ex: postgresql://user:pass@host:port/db
  // Futuramente:
  // JWT_SECRET: z.string().min(1),
  // API_BASE_URL: z.string().url().default('http://localhost:3333'),
  // CORS_ORIGIN: z.string().default('*'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables.');
}

export const env = _env.data;
