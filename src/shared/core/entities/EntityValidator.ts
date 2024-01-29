import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

export abstract class EntityValidator {
  abstract validate(validatorPipe: ZodEntityValidationPipe): void
}
