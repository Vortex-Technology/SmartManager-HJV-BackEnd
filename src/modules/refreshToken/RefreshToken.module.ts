import { Module } from '@nestjs/common'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { DateModule } from '@providers/date/date.module'
import { RefreshTokenController } from './controllers/refreshToken.controller'
import { RefreshTokenService } from './services/RefreshToken.service'
import { EnvModule } from '@infra/env/Env.module'
import { DatabaseModule } from '@infra/database/Database.module'

@Module({
  controllers: [RefreshTokenController],
  imports: [DatabaseModule, CryptographyModule, DateModule, EnvModule],
  providers: [RefreshTokenService],
})
export class RefreshTokenModule {}
