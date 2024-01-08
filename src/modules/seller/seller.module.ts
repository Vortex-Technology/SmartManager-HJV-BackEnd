import { DatabaseModule } from '@infra/database/database.module'
import { EnvModule } from '@infra/env/env.module'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { DateModule } from '@providers/date/date.module'
import { LoginSellerService } from './services/loginSeller.service'
import { LoginSellerController } from './controllers/loginSeller.controller'
import { GetSellerController } from './controllers/getSeller.controller'
import { GetSellerService } from './services/getSeller.service'

@Module({
  controllers: [LoginSellerController, GetSellerController],
  imports: [DatabaseModule, CryptographyModule, EnvModule, DateModule],
  providers: [LoginSellerService, GetSellerService],
})
export class SellerModule {}
