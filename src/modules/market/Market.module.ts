import { DatabaseModule } from '@infra/database/Database.module'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { CreateMarketService } from './services/CreateMarket.service'
import { CreateMarketController } from './controllers/CreateMarket.controller'
import { ValidateApiKeyService } from '@modules/company/services/ValidateApiKey.service'
import { AddCollaboratorMarketController } from './controllers/AddCollaboratorMarket.controller'
import { AddCollaboratorMarketService } from './services/AddCollaboratorMarket.service'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  providers: [
    CreateMarketService,
    ValidateApiKeyService,
    AddCollaboratorMarketService,
  ],
  controllers: [CreateMarketController, AddCollaboratorMarketController],
})
export class MarketModule {}
