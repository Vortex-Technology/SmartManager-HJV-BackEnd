import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/index.service'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { ProductsRepository } from '@modules/product/repositories/ProductsRepository'
import { InventoriesRepository } from '@modules/inventory/repositories/InventoriesRepository'
import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'
import { CollaboratorsPrismaRepository } from './prisma/collaborator/CollaboratorsPrismaRepository'
import { UsersRepository } from '@modules/user/repositories/UsersRepository'
import { UsersPrismaRepository } from './prisma/user/UsersPrismaRepository'
import { SellersRepository } from '@modules/seller/repositories/SellersRepository'
import { SellersPrismaRepository } from './prisma/seller/SellersPrismaRepository'
import { RefreshTokensRepository } from '@modules/refreshToken/repositories/RefreshTokensRepository'
import { RefreshTokensPrismaRepository } from './prisma/refreshToken/RefreshTokensPrismaRepository'
import { ProductCategoriesRepository } from '@modules/product/repositories/ProductCategoriesRepository'
import { ProductCategoriesPrismaRepository } from './prisma/product/ProductCategoriesPrismaRepository'
import { ProductsPrismaRepository } from './prisma/product/ProductsPrismaRepository'
import { ProductVariantInventoriesPrismaRepository } from './prisma/inventory/ProductVariantInventoriesPrismaRepository'
import { InventoriesPrismaRepository } from './prisma/inventory/InventoriesPrismaRepository'
import { ProductVariantsPrismaRepository } from './prisma/product/ProductVariantsPrismaRepository'
import { CompaniesRepository } from '@modules/company/repositories/CompaniesRepository'
import { CompaniesPrismaRepository } from './prisma/company/CompaniesPrismaRepository'
import { MarketsRepository } from '@modules/market/repositories/MarketsRepository'
import { MarketsPrismaRepository } from './prisma/market/MarketsPrismaRepository'

@Module({
  providers: [
    PrismaService,
    {
      provide: RefreshTokensRepository,
      useClass: RefreshTokensPrismaRepository,
    },
    {
      provide: CompaniesRepository,
      useClass: CompaniesPrismaRepository,
    },
    {
      provide: MarketsRepository,
      useClass: MarketsPrismaRepository,
    },
    {
      provide: SellersRepository,
      useClass: SellersPrismaRepository,
    },

    {
      provide: ProductCategoriesRepository,
      useClass: ProductCategoriesPrismaRepository,
    },
    {
      provide: ProductVariantsRepository,
      useClass: ProductVariantsPrismaRepository,
    },
    {
      provide: ProductsRepository,
      useClass: ProductsPrismaRepository,
    },
    {
      provide: ProductVariantInventoriesRepository,
      useClass: ProductVariantInventoriesPrismaRepository,
    },
    {
      provide: InventoriesRepository,
      useClass: InventoriesPrismaRepository,
    },
    {
      provide: CollaboratorsRepository,
      useClass: CollaboratorsPrismaRepository,
    },
    {
      provide: UsersRepository,
      useClass: UsersPrismaRepository,
    },
  ],
  exports: [
    PrismaService,
    RefreshTokensRepository,
    ProductCategoriesRepository,
    ProductVariantsRepository,
    ProductsRepository,
    ProductVariantInventoriesRepository,
    InventoriesRepository,
    CollaboratorsRepository,
    UsersRepository,
    MarketsRepository,
    CompaniesRepository,
  ],
})
export class DatabaseModule {}
