import { DatabaseModule } from '@infra/database/Database.module'
import { Module } from '@nestjs/common'
import { VerifyPermissionsOfCollaboratorInCompanyService } from './services/VerifyPermissionsOfCollaboratorInCompany.service'
import { VerifyPermissionsOfCollaboratorInMarketService } from './services/VerifyPermissionsOfCollaboratorInMarket.service'

@Module({
  imports: [DatabaseModule],
  providers: [
    VerifyPermissionsOfCollaboratorInCompanyService,
    VerifyPermissionsOfCollaboratorInMarketService,
  ],
  exports: [
    VerifyPermissionsOfCollaboratorInCompanyService,
    VerifyPermissionsOfCollaboratorInMarketService,
  ],
})
export class InterceptorsModule {}
