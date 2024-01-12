import { Module } from '@nestjs/common'
import { DatabaseModule } from '@infra/database/database.module'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { LoginAdministratorService } from './services/loginAdministrator.service'
import { EnvModule } from '@infra/env/env.module'
import { DateModule } from '@providers/date/date.module'
import { LoginAdministratorController } from './controllers/loginAdministrator.controller'
import { GetAdministratorController } from './controllers/getAdministrator.controller'
import { GetAdministratorService } from './services/getAdministrator.service'
import { DeleteAdministratorController } from './controllers/deleteAdministrator.controller'
import { DeleteAdministratorService } from './services/deleteAdministrator.service'
import { CreateSellerController } from './controllers/createSeller.controller'
import { CreateSellerService } from './services/createSeller.service'
import { CreateAttendantController } from './controllers/createAttendant.controller'
import { CreateAttendantService } from './services/createAttendant.service'
import { ListAdministratorsController } from './controllers/listAdministrators.controller'
import { ListAdministratorsService } from './services/listAdministrators.service'

@Module({
  controllers: [
    LoginAdministratorController,
    GetAdministratorController,
    DeleteAdministratorController,
    CreateSellerController,
    CreateAttendantController,
    ListAdministratorsController,
  ],
  imports: [DatabaseModule, CryptographyModule, DateModule, EnvModule],
  providers: [
    LoginAdministratorService,
    GetAdministratorService,
    DeleteAdministratorService,
    CreateSellerService,
    CreateAttendantService,
    ListAdministratorsService,
  ],
})
export class AdministratorModule {}
