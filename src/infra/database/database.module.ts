import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/index.service'
import { AdministratorRepository } from '@modules/administrator/repositories/AdministratorRepository'
import { AdministratorPrismaRepository } from './prisma/repositories/administrator/AdministratorPrismaRepository'
import { SellerRepository } from '@modules/seller/repositories/SellerRepository'
import { SellerPrismaRepository } from './prisma/repositories/seller/SellerPrismaRepository'
import { AttendantRepository } from '@modules/attendant/repositories/AttendantRepository'
import { AttendantPrismaRepository } from './prisma/repositories/attendant/AttendantPrismaRepository'
import { ProductCategoriesRepository } from '@modules/product/repositories/ProductCategoriesRepository'
import { ProductCategoryPrismaRepository } from './prisma/repositories/product/ProductCategoryPrismaRepository'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { ProductVariantPrismaRepository } from './prisma/repositories/product/ProductVariantPrismaRepository'
import { ProductsRepository } from '@modules/product/repositories/ProductsRepository'
import { ProductPrismaRepository } from './prisma/repositories/product/ProductPrismaRepository'
import { RefreshTokenRepository } from '@modules/refreshToken/repositories/RefreshTokenRepository'
import { RefreshTokenPrismaRepository } from './prisma/repositories/refreshToken/RefreshTokenPrismaRepository'
import { InventoriesRepository } from '@modules/inventory/repositories/InventoriesRepository'
import { InventoryPrismaRepository } from './prisma/repositories/inventory/InventoryPrismaRepository'
import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'
import { ProductVariantInventoryPrismaRepository } from './prisma/repositories/inventory/ProductVariantInventoryPrismaRepository'
import { MastersRepository } from '@modules/master/repositories/MastersRepository'
import { MastersPrismaRepository } from './prisma/repositories/master/MastersPrismaRepository'
import { OwnersRepository } from '@modules/owner/repositories/OwnersRepository'
import { OwnersPrismaRepository } from './prisma/repositories/owners/OwnersPrismaRepository'

@Module({
  providers: [
    PrismaService,
    {
      provide: AdministratorRepository,
      useClass: AdministratorPrismaRepository,
    },
    {
      provide: SellerRepository,
      useClass: SellerPrismaRepository,
    },
    {
      provide: AttendantRepository,
      useClass: AttendantPrismaRepository,
    },
    {
      provide: RefreshTokenRepository,
      useClass: RefreshTokenPrismaRepository,
    },
    {
      provide: ProductCategoriesRepository,
      useClass: ProductCategoryPrismaRepository,
    },
    {
      provide: ProductVariantsRepository,
      useClass: ProductVariantPrismaRepository,
    },
    {
      provide: ProductsRepository,
      useClass: ProductPrismaRepository,
    },

    {
      provide: ProductVariantInventoriesRepository,
      useClass: ProductVariantInventoryPrismaRepository,
    },
    {
      provide: InventoriesRepository,
      useClass: InventoryPrismaRepository,
    },
    {
      provide: MastersRepository,
      useClass: MastersPrismaRepository,
    },
    {
      provide: OwnersRepository,
      useClass: OwnersPrismaRepository,
    },
  ],
  exports: [
    PrismaService,
    AdministratorRepository,
    SellerRepository,
    AttendantRepository,
    RefreshTokenRepository,
    ProductCategoriesRepository,
    ProductVariantsRepository,
    ProductsRepository,
    ProductVariantInventoriesRepository,
    InventoriesRepository,
    MastersRepository,
    OwnersRepository,
  ],
})
export class DatabaseModule {}
