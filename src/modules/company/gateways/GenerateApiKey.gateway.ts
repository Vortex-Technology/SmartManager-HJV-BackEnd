import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { z } from 'zod'

const generateApiKeyParamsSchema = z.object({
  companyId: z.string().uuid(),
})

export type GenerateApiKeyParams = z.infer<typeof generateApiKeyParamsSchema>
export const generateApiKeyParamsValidationPipe = new ZodValidationPipe(
  generateApiKeyParamsSchema,
)
