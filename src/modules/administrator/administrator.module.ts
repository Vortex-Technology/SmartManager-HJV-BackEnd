import { Module } from '@nestjs/common'
import { CreateAdministratorService } from './services/createAdministrator.service'
import { DatabaseModule } from '@infra/database/database.module'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { CreateAdministratorController } from './controllers/createAdministrator.controller'
import { LoginAdministratorService } from './services/loginAdministrator.service'
import { EnvModule } from '@infra/env/env.module'
import { DateModule } from '@providers/date/date.module'
import { LoginAdministratorController } from './controllers/loginAdministrator.controller'

@Module({
  controllers: [CreateAdministratorController, LoginAdministratorController],
  imports: [DatabaseModule, CryptographyModule, DateModule, EnvModule],
  providers: [CreateAdministratorService, LoginAdministratorService],
})
export class AdministratorModule {}
