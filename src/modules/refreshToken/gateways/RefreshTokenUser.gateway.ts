import { ZodValidationPipe } from '@shared/pipes/ZodValidation'
import { z } from 'zod'

const refreshTokenBodySchema = z.object({
  refreshToken: z
    .string()
    .regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
      'Invalid refresh token',
    ),
})

export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>
export const refreshTokenBodyValidationPipe = new ZodValidationPipe(
  refreshTokenBodySchema,
)
