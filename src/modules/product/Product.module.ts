import { Module } from '@nestjs/common'
import { DatabaseModule } from '@infra/database/Database.module'
import { CreateProductController } from './controllers/CreateProduct.controller'
import { CreateProductService } from './services/CreateProduct.service'
import { CreateProductCategoryController } from './controllers/CreateProductCategory.controller'
import { CreateProductCategoryService } from './services/CreateProductCategory.service'
import { InterceptorsModule } from '@modules/interceptors/Interceptors.module'
import { ValidateApiKeyService } from '@modules/company/services/ValidateApiKey.service'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'

@Module({
  imports: [DatabaseModule, InterceptorsModule, CryptographyModule],
  controllers: [CreateProductController, CreateProductCategoryController],
  providers: [
    CreateProductService,
    CreateProductCategoryService,
    ValidateApiKeyService,
  ],
})
export class ProductModule {}
