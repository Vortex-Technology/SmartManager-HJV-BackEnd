import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().optional().default(3030),
  SOCKET_PORT: z.coerce.number().optional().default(3031),
  JWT_PRIVATE_kEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  JWT_USER_ACCESS_EXPIRES_IN: z.string(),
  JWT_USER_REFRESH_EXPIRES_IN: z.string(),
  JWT_ADM_ACCESS_EXPIRES_IN: z.string(),
  JWT_ADM_REFRESH_EXPIRES_IN: z.string(),
  ADM_REFRESH_EXPIRES_IN: z.coerce.number(),
  USER_REFRESH_EXPIRES_IN: z.coerce.number(),
  NODE_ENV: z
    .enum(['development', 'production', 'debug', 'test'])
    .default('production'),
  CLOUDFLARE_END_POINT: z.string().url(),
  CLOUDFLARE_ACCESS_KEY: z.string(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_BUCKET: z.string(),
})

export type Env = z.infer<typeof envSchema>
