import { DatabaseModule } from '@infra/database/database.module'
import { Module } from '@nestjs/common'
import { CreateProductCategoryController } from './controllers/createProductCategory.controller'
import { CreateProductCategoryService } from './services/createProductCategory.service'

@Module({
  controllers: [CreateProductCategoryController],
  imports: [DatabaseModule],
  providers: [CreateProductCategoryService],
})
export class ProductCategoryModule {}
