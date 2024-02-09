import { DatabaseModule } from '@infra/database/Database.module'
import { ValidateApiKeyService } from '@modules/company/services/ValidateApiKey.service'
import { InterceptorsModule } from '@modules/interceptors/Interceptors.module'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { CreateOrderController } from './controllers/CreateOrder.controller'
import { CreateOrderService } from './services/CreateOrder.service'
import { AddProductOnOrderService } from './services/AddProductOnOrder.service'
import { AddProductOnOrderController } from './controllers/AddProductOnOrder.controller'
import { CloseOrderController } from './controllers/CloseOrder.controller'
import { CloseOrderService } from './services/CloseOrder.service'
import { DocModule } from '@providers/docs/Doc.module'

@Module({
  imports: [DatabaseModule, InterceptorsModule, CryptographyModule, DocModule],
  controllers: [
    CreateOrderController,
    AddProductOnOrderController,
    CloseOrderController,
  ],
  providers: [
    ValidateApiKeyService,
    CreateOrderService,
    AddProductOnOrderService,
    CloseOrderService,
  ],
})
export class OrderModule { }
