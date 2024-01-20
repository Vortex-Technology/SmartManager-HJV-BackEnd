import { z } from 'zod'
import { ZodValidationPipe } from '@shared/pipes/zodValidation'

const loginCollaboratorBodySchema = z.object({
  login: z.string().min(4).max(30),
  password: z.string().min(8),
})

export type LoginCollaboratorBody = z.infer<typeof loginCollaboratorBodySchema>
export const loginCollaboratorBodyValidationPipe = new ZodValidationPipe(
  loginCollaboratorBodySchema,
)
