import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { AuthProvider } from '@providers/auth/auth.module'
import { EnvModule } from './env/Env.module'
import { SocketModule } from '@providers/socket/socket.module'
import { CollaboratorModule } from '@modules/collaborator/Collaborator.module'
import { RefreshTokenModule } from '@modules/refreshToken/RefreshToken.module'
import { ProductModule } from '@modules/product/Product.module'
import { SellerModule } from '@modules/seller/Seller.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    CollaboratorModule,
    RefreshTokenModule,
    ProductModule,
    SocketModule,
    SellerModule,
    AuthProvider,
    EnvModule,
  ],
})
export class AppModule {}
