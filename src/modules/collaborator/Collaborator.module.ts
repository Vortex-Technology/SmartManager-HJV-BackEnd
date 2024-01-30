import { Module } from '@nestjs/common'
import { LoginCollaboratorService } from './services/LoginCollaborator.service'
import { GetCollaboratorService } from './services/GetCollaborator.service'
import { EnvModule } from '@infra/env/Env.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { DateModule } from '@providers/date/Date.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { LoginCollaboratorController } from './controllers/LoginCollaborator.controller'
import { GetCollaboratorController } from './controllers/GetCollaborator.controller'
import { InterceptorsModule } from '@modules/interceptors/Interceptors.module'
import { ValidateApiKeyService } from '@modules/company/services/ValidateApiKey.service'

@Module({
  controllers: [LoginCollaboratorController, GetCollaboratorController],
  providers: [
    LoginCollaboratorService,
    GetCollaboratorService,
    ValidateApiKeyService,
  ],
  imports: [
    DatabaseModule,
    DateModule,
    EnvModule,
    CryptographyModule,
    InterceptorsModule,
  ],
})
export class CollaboratorModule {}
