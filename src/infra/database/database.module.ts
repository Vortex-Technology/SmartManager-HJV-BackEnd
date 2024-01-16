import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/index.service'
import { AdministratorRepository } from '@modules/administrator/repositories/AdministratorRepository'
import { AdministratorPrismaRepository } from './prisma/administrator/AdministratorPrismaRepository'
import { SellerRepository } from '@modules/seller/repositories/SellerRepository'
import { SellerPrismaRepository } from './prisma/seller/SellerPrismaRepository'
import { AttendantRepository } from '@modules/attendant/repositories/AttendantRepository'
import { AttendantPrismaRepository } from './prisma/attendant/AttendantPrismaRepository'
import { ProductCategoriesRepository } from '@modules/product/repositories/ProductCategoriesRepository'
import { ProductCategoryPrismaRepository } from './prisma/product/ProductCategoryPrismaRepository'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { ProductVariantPrismaRepository } from './prisma/product/ProductVariantPrismaRepository'
import { ProductsRepository } from '@modules/product/repositories/ProductsRepository'
import { ProductPrismaRepository } from './prisma/product/ProductPrismaRepository'
import { RefreshTokenRepository } from '@modules/refreshToken/repositories/RefreshTokenRepository'
import { RefreshTokenPrismaRepository } from './prisma/refreshToken/RefreshTokenPrismaRepository'
import { InventoriesRepository } from '@modules/inventory/repositories/InventoriesRepository'
import { InventoryPrismaRepository } from './prisma/inventory/InventoryPrismaRepository'
import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'
import { ProductVariantInventoryPrismaRepository } from './prisma/inventory/ProductVariantInventoryPrismaRepository'
import { MastersRepository } from '@modules/master/repositories/MastersRepository'
import { MastersPrismaRepository } from './prisma/master/MastersPrismaRepository'
import { OwnersRepository } from '@modules/owner/repositories/OwnersRepository'
import { OwnersPrismaRepository } from './prisma/owners/OwnersPrismaRepository'
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'
import { CollaboratorsPrismaRepository } from './prisma/collaborator/CollaboratorsPrismaRepository'
import { UsersRepository } from '@modules/user/repositories/UsersRepository'
import { UsersPrismaRepository } from './prisma/user/UsersPrismaRepository'

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
    CollaboratorsRepository,
    UsersRepository,
  ],
})
export class DatabaseModule {}
