import { Module } from '@nestjs/common'
import { LoginCollaboratorController } from './controllers/loginCollaborator.controller'
import { LoginCollaboratorService } from './services/loginCollaborator.service'
import { DatabaseModule } from '@infra/database/database.module'
import { DateModule } from '@providers/date/date.module'
import { EnvModule } from '@infra/env/env.module'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'

@Module({
  controllers: [LoginCollaboratorController],
  providers: [LoginCollaboratorService],
  imports: [DatabaseModule, DateModule, EnvModule, CryptographyModule],
})
export class CollaboratorModule {}
