import { Module } from '@nestjs/common'
import { CreateOwnerService } from './services/createOwner.service'
import { DatabaseModule } from '@infra/database/database.module'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { CreateOwnerController } from './controllers/createOwner.controller'
import { GetOwnerController } from './controllers/getOwner.controller'
import { GetOwnerService } from './services/getOwner.service'
import { DateModule } from '@providers/date/date.module'
import { EnvModule } from '@infra/env/env.module'

@Module({
  controllers: [CreateOwnerController, GetOwnerController],
  providers: [CreateOwnerService, GetOwnerService],
  imports: [DatabaseModule, CryptographyModule, DateModule, EnvModule],
})
export class OwnerModule {}
