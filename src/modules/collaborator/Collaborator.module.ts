import { Module } from '@nestjs/common'
import { LoginCollaboratorController } from './controllers/loginCollaborator.controller'
import { LoginCollaboratorService } from './services/LoginCollaborator.service'
import { GetCollaboratorService } from './services/GetCollaborator.service'
import { EnvModule } from '@infra/env/Env.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { DateModule } from '@providers/date/Date.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'

@Module({
  controllers: [LoginCollaboratorController],
  providers: [LoginCollaboratorService, GetCollaboratorService],
  imports: [DatabaseModule, DateModule, EnvModule, CryptographyModule],
})
export class CollaboratorModule {}