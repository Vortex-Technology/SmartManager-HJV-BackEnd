import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { EnvModule } from './env/Env.module'
import { SocketModule } from '@providers/socket/Socket.module'
import { AuthProvider } from '@providers/auth/Auth.module'
import { UserModule } from '@modules/user/User.module'
import { CompanyModule } from '@modules/company/Company.module'
import { MarketModule } from '@modules/market/Market.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    // CollaboratorModule,
    // RefreshTokenModule,
    // ProductModule,
    // SellerModule,
    UserModule,
    CompanyModule,
    MarketModule,
    SocketModule,
    AuthProvider,
    EnvModule,
  ],
})
export class AppModule {}
