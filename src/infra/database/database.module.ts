import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/index.service'
import { AdministratorRepository } from '@modules/administrator/repositories/AdministratorRepository'
import { AdministratorPrismaRepository } from './prisma/repositories/administrator/AdministratorPrismaRepository'
import { RefreshAdministratorTokenRepository } from '@modules/administrator/repositories/RefreshAdministratorTokenRepository'
import { RefreshAdministratorTokenPrismaRepository } from './prisma/repositories/administrator/RefreshAdministratorTokenPrismaRepository'
import { SellerRepository } from '@modules/seller/repositories/SellerRepository'
import { SellerPrismaRepository } from './prisma/repositories/seller/SellerPrismaRepository'
import { AttendantRepository } from '@modules/attendant/repositories/AttendantRepository'
import { AttendantPrismaRepository } from './prisma/repositories/attendant/AttendantPrismaRepository'
import { RefreshSellerTokenRepository } from '@modules/seller/repositories/RefreshSellerTokenRepository'
import { RefreshSellerTokenPrismaRepository } from './prisma/repositories/seller/RefreshSellerTokenPrismaRepository'
import { RefreshAttendantTokenRepository } from '@modules/attendant/repositories/RefreshAttendantTokenRepository'
import { RefreshAttendantTokenPrismaRepository } from './prisma/repositories/attendant/RefreshAttendantTokenPrismaRepository'
import { ProductCategoriesRepository } from '@modules/product/repositories/ProductCategoriesRepository'
import { ProductCategoryPrismaRepository } from './prisma/repositories/product/ProductCategoryPrismaRepository'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { ProductVariantPrismaRepository } from './prisma/repositories/product/ProductVariantPrismaRepository'
import { ProductsRepository } from '@modules/product/repositories/ProductsRepository'
import { ProductPrismaRepository } from './prisma/repositories/product/ProductPrismaRepository'

@Module({
  providers: [
    PrismaService,
    {
      provide: AdministratorRepository,
      useClass: AdministratorPrismaRepository,
    },
    {
      provide: RefreshAdministratorTokenRepository,
      useClass: RefreshAdministratorTokenPrismaRepository,
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
      provide: RefreshSellerTokenRepository,
      useClass: RefreshSellerTokenPrismaRepository,
    },
    {
      provide: RefreshAttendantTokenRepository,
      useClass: RefreshAttendantTokenPrismaRepository,
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
  ],
  exports: [
    PrismaService,
    AdministratorRepository,
    RefreshAdministratorTokenRepository,
    SellerRepository,
    AttendantRepository,
    RefreshSellerTokenRepository,
    RefreshAttendantTokenRepository,
    ProductCategoriesRepository,
    ProductVariantsRepository,
    ProductsRepository,
  ],
})
export class DatabaseModule {}
