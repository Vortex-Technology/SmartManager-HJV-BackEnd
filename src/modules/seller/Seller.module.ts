import { Module } from '@nestjs/common'
import { LoginSellerController } from './controllers/loginSeller.controller'
import { GetSellerController } from './controllers/getSeller.controller'
import { ListSellersController } from './controllers/listSellers.controller'
import { EnvModule } from '@infra/env/Env.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DateModule } from '@providers/date/Date.module'

@Module({
  controllers: [
    LoginSellerController,
    GetSellerController,
    ListSellersController,
  ],
  imports: [DatabaseModule, CryptographyModule, EnvModule, DateModule],
})
export class SellerModule {}
