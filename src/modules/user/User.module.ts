import { Module } from '@nestjs/common'
import { DatabaseModule } from '@infra/database/Database.module'
import { EnvModule } from '@infra/env/Env.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DateModule } from '@providers/date/Date.module'
import { CreateUserController } from './controllers/CreateUser.controller'
import { CreateUserService } from './services/CreateUser.service'
import { LoginUserController } from './controllers/LoginUser.controller'
import { LoginUserService } from './services/LoginUser.service'
import { GetUserController } from './controllers/GetUser.controller'
import { GetUserService } from './services/GetUser.service'

@Module({
  controllers: [CreateUserController, LoginUserController, GetUserController],
  imports: [DatabaseModule, CryptographyModule, EnvModule, DateModule],
  providers: [CreateUserService, LoginUserService, GetUserService],
})
export class UserModule {}
