import { DatabaseModule } from '@infra/database/Database.module'
import { ValidateApiKeyService } from '@modules/company/services/ValidateApiKey.service'
import { InterceptorsModule } from '@modules/interceptors/Interceptors.module'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { CreateOrderController } from './controllers/CreateOrder.controller'
import { CreateOrderService } from './services/CreateOrder.service'

@Module({
  imports: [DatabaseModule, InterceptorsModule, CryptographyModule],
  controllers: [CreateOrderController],
  providers: [ValidateApiKeyService, CreateOrderService],
})
export class OrderModule {}
