import { Module } from '@nestjs/common'
import { CreateAdministratorService } from './services/createAdministrator.service'
import { DatabaseModule } from '@infra/database/database.module'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { CreateAdministratorController } from './controllers/createAdministrator.controller'

@Module({
  controllers: [CreateAdministratorController],
  imports: [DatabaseModule, CryptographyModule],
  providers: [CreateAdministratorService],
})
export class AdministratorModule {}
