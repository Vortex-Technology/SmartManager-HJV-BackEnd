import { Module } from '@nestjs/common'
import { LoginUserService } from './services/LoginUser.service'
import { DatabaseModule } from '@infra/database/Database.module'
import { EnvModule } from '@infra/env/Env.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DateModule } from '@providers/date/Date.module'

@Module({
  imports: [DatabaseModule, CryptographyModule, EnvModule, DateModule],
  providers: [LoginUserService],
})
export class UserModule {}
