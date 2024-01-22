import { Module } from '@nestjs/common'
import { DatabaseModule } from '@infra/database/Database.module'
import { CreateProductController } from './controllers/CreateProduct.controller'
import { CreateProductService } from './services/CreateProduct.service'
import { CreateProductCategoryController } from './controllers/CreateProductCategory.controller'
import { CreateProductCategoryService } from './services/CreateProductCategory.service'

@Module({
  controllers: [CreateProductController, CreateProductCategoryController],
  providers: [CreateProductService, CreateProductCategoryService],
  imports: [DatabaseModule],
})
export class ProductModule {}
