import { DatabaseModule } from '@infra/database/Database.module'
import { ValidateApiKeyService } from '@modules/company/services/ValidateApiKey.service'
import { InterceptorsModule } from '@modules/interceptors/Interceptors.module'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { CreateOrderController } from './controllers/CreateOrder.controller'
import { CreateOrderService } from './services/CreateOrder.service'
import { AddProductOnOrderService } from './services/AddProductOnOrder.service'
import { AddProductOnOrderController } from './controllers/AddProductOnOrder.controller'

@Module({
  imports: [DatabaseModule, InterceptorsModule, CryptographyModule],
  controllers: [CreateOrderController, AddProductOnOrderController],
  providers: [
    ValidateApiKeyService,
    CreateOrderService,
    AddProductOnOrderService,
  ],
})
export class OrderModule {}
