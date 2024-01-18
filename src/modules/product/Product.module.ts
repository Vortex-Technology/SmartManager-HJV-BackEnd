import { Module } from '@nestjs/common'
import { CreateProductCategoryController } from './controllers/createProductCategory.controller'
import { CreateProductController } from './controllers/createProduct.controller'
import { DatabaseModule } from '@infra/database/Database.module'
import { CreateProductCategoryService } from './services/CreateProductCategory.service'
import { CreateProductService } from './services/CreateProduct.service'

@Module({
  controllers: [CreateProductCategoryController, CreateProductController],
  imports: [DatabaseModule],
  providers: [CreateProductCategoryService, CreateProductService],
})
export class ProductModule {}
