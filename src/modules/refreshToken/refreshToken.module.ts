import { DatabaseModule } from '@infra/database/database.module'
import { EnvModule } from '@infra/env/env.module'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { DateModule } from '@providers/date/date.module'
import { RefreshTokenController } from './controllers/refreshToken.controller'
import { RefreshTokenService } from './services/refreshToken.service'

@Module({
  controllers: [RefreshTokenController],
  imports: [DatabaseModule, CryptographyModule, DateModule, EnvModule],
  providers: [RefreshTokenService],
})
export class RefreshTokenModule {}
