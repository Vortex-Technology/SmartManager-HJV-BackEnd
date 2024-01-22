import { DatabaseModule } from '@infra/database/Database.module'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'

@Module({
  imports: [DatabaseModule, CryptographyModule],
})
export class MarketModule {}
