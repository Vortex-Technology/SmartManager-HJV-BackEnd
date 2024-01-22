import { Module } from '@nestjs/common'

import { EnvModule } from '@infra/env/Env.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DateModule } from '@providers/date/Date.module'

@Module({
  controllers: [],
  imports: [DatabaseModule, CryptographyModule, EnvModule, DateModule],
})
export class SellerModule {}
