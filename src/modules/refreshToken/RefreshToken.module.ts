import { Module } from '@nestjs/common'
import { EnvModule } from '@infra/env/Env.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DateModule } from '@providers/date/Date.module'
import { RefreshTokenUserController } from './controllers/RefreshTokenUser.controller'
import { RefreshTokenUserService } from './services/RefreshTokenUser.service'

@Module({
  controllers: [RefreshTokenUserController],
  providers: [RefreshTokenUserService],
  imports: [DatabaseModule, CryptographyModule, DateModule, EnvModule],
})
export class RefreshTokenModule {}
