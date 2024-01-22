import { z } from 'zod'
import { ZodValidationPipe } from '@shared/pipes/zodValidation'

const loginCollaboratorBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export type LoginCollaboratorBody = z.infer<typeof loginCollaboratorBodySchema>
export const loginCollaboratorBodyValidationPipe = new ZodValidationPipe(
  loginCollaboratorBodySchema,
)

const loginCollaboratorParamsSchema = z.object({
  marketId: z.string().uuid(),
  companyId: z.string().uuid(),
})

export type LoginCollaboratorParams = z.infer<
  typeof loginCollaboratorParamsSchema
>
export const loginCollaboratorParamsValidationPipe = new ZodValidationPipe(
  loginCollaboratorParamsSchema,
)
