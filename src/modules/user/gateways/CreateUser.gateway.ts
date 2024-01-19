import { z } from 'zod'
import { ZodValidationPipe } from '@shared/pipes/zodValidation'

const createUserBodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(4).max(30),
  password: z.string().min(8),
  image: z.string().url().optional(),
})

export type CreateUserBody = z.infer<typeof createUserBodySchema>
export const createUserBodyValidationPipe = new ZodValidationPipe(
  createUserBodySchema,
)
