import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CollaboratorWrongCredentials } from '@modules/collaborator/errors/CollaboratorWrongCredentials'
import { ApiKeyIsRevoked } from '@modules/company/errors/ApiKeyIsRevoked'
import { CompanyInactive } from '@modules/company/errors/CompanyInactive'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { LotsOfExistingKeys } from '@modules/company/errors/LotsOfExistingKeys'
import { InventoryNotFount } from '@modules/inventory/errors/InventoryNotFound'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { AllProductVariantAlreadyExists } from '@modules/product/errors/AllProductVariantAlreadyExists'
import { ProductCategoryAlreadyExists } from '@modules/product/errors/ProductCategoryAlreadyExists'
import { ProductNotFound } from '@modules/product/errors/ProductNotFound'
import { ProductVariantAlreadyExistsWithSame } from '@modules/product/errors/ProductVariantAlreadyExistsWithSame'
import { SessionExpired } from '@modules/refreshToken/errors/SessionExpired'
import { UserAlreadyExistsWithSameEmail } from '@modules/user/errors/UserAlreadyExistsWithSameEmail'
import { UserNotFound } from '@modules/user/errors/UserNotFound'
import { UserWrongCredentials } from '@modules/user/errors/UserWrongCredentials'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ServiceError } from '@shared/core/error/ServiceError'

export class ErrorPresenter {
  static toHTTP(error: ServiceError) {
    switch (error.constructor) {
      case CollaboratorNotFound:
      case CompanyNotFound:
      case InventoryNotFount:
      case MarketNotFound:
      case ProductNotFound:
      case UserNotFound: {
        throw new NotFoundException(error.message)
      }

      case LotsOfExistingKeys:
      case AllProductVariantAlreadyExists:
      case ProductCategoryAlreadyExists:
      case ProductVariantAlreadyExistsWithSame:
      case UserAlreadyExistsWithSameEmail: {
        throw new ConflictException(error.message)
      }

      case CollaboratorWrongCredentials:
      case UserWrongCredentials:
      case CompanyInactive: {
        throw new ForbiddenException(error.message)
      }

      case ApiKeyIsRevoked:
      case SessionExpired: {
        throw new UnauthorizedException(error.message)
      }

      default: {
        throw new BadRequestException(error.message)
      }
    }
  }
}
