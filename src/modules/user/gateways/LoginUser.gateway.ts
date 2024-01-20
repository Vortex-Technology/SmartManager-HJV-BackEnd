import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { z } from 'zod'

const loginUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export type LoginUserBody = z.infer<typeof loginUserBodySchema>
export const loginUserBodyValidationPipe = new ZodValidationPipe(
  loginUserBodySchema,
)
