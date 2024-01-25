import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { ZodValidationPipe } from '@shared/pipes/ZodValidation'
import { z } from 'zod'

const addCollaboratorMarketBodySchema = z.object({
  name: z.string().min(3).max(30),
  image: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  actualRemuneration: z.number().positive(),
  collaboratorRole: z.enum([
    CollaboratorRole.MANAGER,
    CollaboratorRole.SELLER,
    CollaboratorRole.STOCKIST,
  ]),
})

export type AddCollaboratorMarketBody = z.infer<
  typeof addCollaboratorMarketBodySchema
>
export const addCollaboratorMarketBodyValidationPipe = new ZodValidationPipe(
  addCollaboratorMarketBodySchema,
)

const addCollaboratorMarketParamsSchema = z.object({
  companyId: z.string().uuid(),
  marketId: z.string().uuid(),
})

export type AddCollaboratorMarketParams = z.infer<
  typeof addCollaboratorMarketParamsSchema
>
export const addCollaboratorMarketParamsValidationPipe = new ZodValidationPipe(
  addCollaboratorMarketParamsSchema,
)
