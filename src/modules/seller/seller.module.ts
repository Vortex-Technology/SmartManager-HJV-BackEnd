import { DatabaseModule } from '@infra/database/database.module'
import { EnvModule } from '@infra/env/env.module'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { DateModule } from '@providers/date/date.module'
import { LoginSellerService } from './services/loginSeller.service'
import { LoginSellerController } from './controllers/loginSeller.controller'

@Module({
  controllers: [LoginSellerController],
  imports: [DatabaseModule, CryptographyModule, EnvModule, DateModule],
  providers: [LoginSellerService],
})
export class SellerModule {}
