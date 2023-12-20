import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/index.service'
import { AdministratorRepository } from '@modules/administrator/repositories/AdministratorRepository'
import { AdministratorPrismaRepository } from './prisma/repositories/administrator/AdministratorPrismaRepository'
import { RefreshAdministratorTokenRepository } from '@modules/administrator/repositories/RefreshAdministratorTokenRepository'
import { RefreshAdministratorTokenPrismaRepository } from './prisma/repositories/administrator/RefreshAdministratorTokenPrismaRepository'

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
  ],
  exports: [
    PrismaService,
    AdministratorRepository,
    RefreshAdministratorTokenRepository,
  ],
})
export class DatabaseModule {}
