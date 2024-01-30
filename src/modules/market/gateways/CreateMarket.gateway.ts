import { ZodValidationPipe } from '@shared/pipes/ZodValidation'
import { z } from 'zod'

const createMarketBodySchema = z.object({
  tradeName: z.string().min(3).max(30),
  street: z.string().min(3).max(30),
  number: z.string().min(1).max(6),
  neighborhood: z.string().min(3).max(30),
  city: z.string().min(3).max(30),
  state: z.string().min(2).max(3),
  postalCode: z.string().min(8).max(8),
  country: z.string().max(3).optional(),
  complement: z.string().max(100).optional(),
})

export type CreateMarketBody = z.infer<typeof createMarketBodySchema>
export const createMarketBodyValidationPipe = new ZodValidationPipe(
  createMarketBodySchema,
)
