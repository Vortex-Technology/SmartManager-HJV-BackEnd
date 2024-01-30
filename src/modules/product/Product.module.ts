import { Module } from '@nestjs/common'
import { DatabaseModule } from '@infra/database/Database.module'
import { CreateProductController } from './controllers/CreateProduct.controller'
import { CreateProductService } from './services/CreateProduct.service'
import { CreateProductCategoryController } from './controllers/CreateProductCategory.controller'
import { CreateProductCategoryService } from './services/CreateProductCategory.service'
import { InterceptorsModule } from '@modules/interceptors/Interceptors.module'
import { ValidateApiKeyService } from '@modules/company/services/ValidateApiKey.service'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { CreateProductVariantController } from './controllers/CreateProductVariant.controller'
import { CreateProductVariantService } from './services/CreateProductVariant.service'

@Module({
  imports: [DatabaseModule, InterceptorsModule, CryptographyModule],
  controllers: [
    CreateProductController,
    CreateProductCategoryController,
    CreateProductVariantController,
  ],
  providers: [
    ValidateApiKeyService,
    CreateProductService,
    CreateProductCategoryService,
    CreateProductVariantService,
  ],
})
export class ProductModule {}
