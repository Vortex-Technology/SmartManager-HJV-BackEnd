import { ZodValidationPipe } from '@shared/pipes/ZodValidation'
import { z } from 'zod'

const addProductOnOrderBodySchema = z.object({
  quantity: z.coerce.number().min(1),
  barcode: z.string().max(48),
})

export type AddProductOnOrderBody = z.infer<typeof addProductOnOrderBodySchema>
export const addProductOnOrderBodyValidationPipe = new ZodValidationPipe(
  addProductOnOrderBodySchema,
)

const addProductOnOrderParamsSchema = z.object({
  orderId: z.string().uuid(),
})

export type AddProductOnOrderParams = z.infer<
  typeof addProductOnOrderParamsSchema
>
export const addProductOnOrderParamsValidationPipe = new ZodValidationPipe(
  addProductOnOrderParamsSchema,
)
