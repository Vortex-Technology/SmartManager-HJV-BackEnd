import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { z } from 'zod'

const createCompanyBodySchema = z.object({
  startedIssueInvoicesNow: z.boolean(),
  companyName: z.string().min(4).max(30),
  email: z.string().email(),
  documentation: z.string().max(100).optional(),
  documentationType: z.enum(['IE', 'LE']).optional(),
  stateRegistration: z.string().optional(),
  sector: z.string().min(3).max(30),
  street: z.string().min(3).max(60),
  number: z.string().min(1).max(6),
  neighborhood: z.string().min(3).max(30),
  city: z.string().min(3).max(30),
  state: z.string().min(2).max(3),
  postalCode: z.string().min(8).max(8),
  country: z.string().max(3).optional(),
  complement: z.string().max(100).optional(),
  markets: z
    .array(
      z.object({
        tradeName: z.string().min(3).max(30),
        street: z.string().min(3).max(30),
        number: z.string().min(1).max(6),
        neighborhood: z.string().min(3).max(30),
        city: z.string().min(3).max(30),
        state: z.string().min(2).max(3),
        postalCode: z.string().min(8).max(8),
        country: z.string().max(3).optional(),
        complement: z.string().max(100).optional(),
      }),
    )
    .min(1),
})

export type CreateCompanyBody = z.infer<typeof createCompanyBodySchema>
export const createCompanyBodyValidationPipe = new ZodValidationPipe(
  createCompanyBodySchema,
)
