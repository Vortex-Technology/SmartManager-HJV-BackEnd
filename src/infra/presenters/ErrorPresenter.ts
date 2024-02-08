import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CollaboratorWrongCredentials } from '@modules/collaborator/errors/CollaboratorWrongCredentials'
import { ApiKeyIsRevoked } from '@modules/company/errors/ApiKeyIsRevoked'
import { CompanyInactive } from '@modules/company/errors/CompanyInactive'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { LotsOfExistingKeys } from '@modules/company/errors/LotsOfExistingKeys'
import { InventoryNotFount } from '@modules/inventory/errors/InventoryNotFound'
import { NotEnoughItems } from '@modules/inventory/errors/NotEnoughItems'
import { ProductVariantInventoryNotFound } from '@modules/inventory/errors/ProductVariantInventoryNotFound'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { OrderNotFound } from '@modules/order/errors/OrderNotFound'
import { AllProductVariantAlreadyExists } from '@modules/product/errors/AllProductVariantAlreadyExists'
import { ProductCategoryAlreadyExists } from '@modules/product/errors/ProductCategoryAlreadyExists'
import { ProductNotFound } from '@modules/product/errors/ProductNotFound'
import { ProductVariantAlreadyExistsWithSame } from '@modules/product/errors/ProductVariantAlreadyExistsWithSame'
import { ProductVariantNotFound } from '@modules/product/errors/ProductVariantNotFound'
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

/**
 * @class ErrorPresenter - Present all possible application errors
 */
export class ErrorPresenter {
  static toHTTP(error: ServiceError) {
    switch (error.constructor) {
      case CollaboratorNotFound:
      case CompanyNotFound:
      case InventoryNotFount:
      case MarketNotFound:
      case ProductNotFound:
      case UserNotFound:
      case OrderNotFound:
      case ProductVariantNotFound:
      case ProductVariantInventoryNotFound: {
        throw new NotFoundException(error.message)
      }

      case LotsOfExistingKeys:
      case AllProductVariantAlreadyExists:
      case ProductCategoryAlreadyExists:
      case ProductVariantAlreadyExistsWithSame:
      case UserAlreadyExistsWithSameEmail:
      case NotEnoughItems: {
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
