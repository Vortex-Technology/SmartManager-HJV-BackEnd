import { ProductUnitType } from '../entities/Product'
import { z } from 'zod'
import { ZodValidationPipe } from '@shared/pipes/ZodValidation'

const createProductBodySchema = z.object({
  name: z.string().min(3).max(60),
  categories: z.array(z.string()).optional(),
  inventoryId: z.string().uuid(),
  variants: z
    .array(
      z.object({
        name: z.string().min(3).max(60),
        description: z.string().max(190).optional(),
        model: z.string().max(60).optional(),
        pricePerUnit: z.number().min(5),
        brand: z.string().min(2).max(60),
        image: z.string().url().optional(),
        barCode: z.string().max(48),
        quantity: z.coerce.number().min(1),
        unitType: z.nativeEnum(ProductUnitType),
      }),
    )
    .min(1),
})

export type CreateProductBody = z.infer<typeof createProductBodySchema>
export const createProductBodyValidationPipe = new ZodValidationPipe(
  createProductBodySchema,
)
