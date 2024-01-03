import { DatabaseModule } from '@infra/database/database.module'
import { Module } from '@nestjs/common'
import { CreateProductCategoryController } from './controllers/createProductCategory.controller'
import { CreateProductCategoryService } from './services/createProductCategory.service'
import { CreateProductController } from './controllers/createProduct.controller'
import { CreateProductService } from './services/createProduct.service'

@Module({
  controllers: [CreateProductCategoryController, CreateProductController],
  imports: [DatabaseModule],
  providers: [CreateProductCategoryService, CreateProductService],
})
export class ProductModule {}
