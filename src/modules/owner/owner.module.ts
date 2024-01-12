import { Module } from '@nestjs/common'
import { CreateOwnerService } from './services/createOwner.service'
import { DatabaseModule } from '@infra/database/database.module'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { CreateOwnerController } from './controllers/createOwner.controller'

@Module({
  controllers: [CreateOwnerController],
  providers: [CreateOwnerService],
  imports: [DatabaseModule, CryptographyModule],
})
export class OwnerModule {}
