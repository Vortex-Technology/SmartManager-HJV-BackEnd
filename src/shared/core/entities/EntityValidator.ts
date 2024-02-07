import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'
/**
 * @class EntityValidator - An abstract class that is used to validate entity
 */
export abstract class EntityValidator {
  abstract validate(validatorPipe: ZodEntityValidationPipe): void
}
