import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { AuthProvider } from '@providers/auth/auth.module'
import { EnvModule } from './env/env.module'
import { AdministratorModule } from '@modules/administrator/administrator.module'
import { SocketModule } from '@providers/socket/socket.module'
import { SellerModule } from '@modules/seller/seller.module'
import { AttendantModule } from '@modules/attendant/attendant.module'
import { ProductModule } from '@modules/product/product.module'
import { RefreshTokenModule } from '@modules/refreshToken/refreshToken.module'
import { OwnerModule } from '@modules/owner/owner.module'
import { CollaboratorModule } from '@modules/collaborator/collaborator.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AdministratorModule,
    CollaboratorModule,
    RefreshTokenModule,
    AttendantModule,
    ProductModule,
    SocketModule,
    SellerModule,
    AuthProvider,
    OwnerModule,
    EnvModule,
  ],
})
export class AppModule {}
