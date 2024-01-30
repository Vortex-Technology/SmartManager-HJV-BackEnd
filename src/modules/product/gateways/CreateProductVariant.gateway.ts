import { z } from 'zod'
import { ProductUnitType } from '../entities/Product'
import { ZodValidationPipe } from '@shared/pipes/ZodValidation'

const createProductVariantBodySchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().max(190).optional(),
  model: z.string().max(60).optional(),
  pricePerUnit: z.number().min(5),
  brand: z.string().min(2).max(60),
  image: z.string().url().optional(),
  barCode: z.string().max(48),
  quantity: z.coerce.number().min(1),
  unitType: z.nativeEnum(ProductUnitType),
  inventoryId: z.string().uuid(),
})

export type CreateProductVariantBody = z.infer<
  typeof createProductVariantBodySchema
>
export const createProductVariantBodyValidationPipe = new ZodValidationPipe(
  createProductVariantBodySchema,
)

const createProductVariantParamsSchema = z.object({
  productId: z.string().uuid(),
})

export type CreateProductVariantParams = z.infer<
  typeof createProductVariantParamsSchema
>
export const createProductVariantParamsValidationPipe = new ZodValidationPipe(
  createProductVariantParamsSchema,
)
