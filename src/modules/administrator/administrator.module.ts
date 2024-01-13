import { Module } from '@nestjs/common'
import { DatabaseModule } from '@infra/database/database.module'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { LoginAdministratorService } from './services/loginAdministrator.service'
import { EnvModule } from '@infra/env/env.module'
import { DateModule } from '@providers/date/date.module'
import { LoginAdministratorController } from './controllers/loginAdministrator.controller'
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
    DeleteAdministratorController,
    CreateSellerController,
    CreateAttendantController,
    ListAdministratorsController,
  ],
  imports: [DatabaseModule, CryptographyModule, DateModule, EnvModule],
  providers: [
    LoginAdministratorService,
    DeleteAdministratorService,
    CreateSellerService,
    CreateAttendantService,
    ListAdministratorsService,
  ],
})
export class AdministratorModule {}
