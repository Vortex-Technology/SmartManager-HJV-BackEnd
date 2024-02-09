import { ZodValidationPipe } from '@shared/pipes/ZodValidation'
import { z } from 'zod'

const closeOrderParamsSchema = z.object({
  orderId: z.string(),
})

export type CloseOrderParams = z.infer<typeof closeOrderParamsSchema>
export const closeOrderParamValidationPipe = new ZodValidationPipe(
  closeOrderParamsSchema,
)
