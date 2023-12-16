import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env'
import { AuthProvider } from '@providers/auth/auth.module'
import { EnvModule } from './env/env.module'
import { AdministratorModule } from '@modules/administrator/administrator.module'
// import { SocketModule } from '@providers/socket/socket.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    AuthProvider,
    // SocketModule,
    AdministratorModule,
  ],
})
export class AppModule {}
