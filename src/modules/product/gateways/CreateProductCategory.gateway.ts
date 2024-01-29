import { ZodValidationPipe } from '@shared/pipes/ZodValidation'
import { z } from 'zod'

const createProductCategoryBodySchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().max(190).optional(),
})

export type CreateProductCategoryBody = z.infer<
  typeof createProductCategoryBodySchema
>
export const createProductCategoryBodyValidationPipe = new ZodValidationPipe(
  createProductCategoryBodySchema,
)
