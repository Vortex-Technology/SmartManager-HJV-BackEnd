import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/index.service'
import { AdministratorRepository } from '@modules/administrator/repositories/AdministratorRepository'
import { AdministratorPrismaRepository } from './prisma/repositories/administrator/AdministratorPrismaRepository'
import { RefreshAdministratorTokenRepository } from '@modules/administrator/repositories/RefreshAdministratorTokenRepository'
import { RefreshAdministratorTokenPrismaRepository } from './prisma/repositories/administrator/RefreshAdministratorTokenPrismaRepository'
import { SellerRepository } from '@modules/seller/repositories/SellerRepository'
import { SellerPrismaRepository } from './prisma/repositories/seller/SellerPrismaRepository'

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
  ],
  exports: [
    PrismaService,
    AdministratorRepository,
    RefreshAdministratorTokenRepository,
    SellerRepository,
  ],
})
export class DatabaseModule {}
