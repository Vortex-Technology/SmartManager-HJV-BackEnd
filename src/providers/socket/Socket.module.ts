import { Module } from '@nestjs/common'
import { SocketGateway } from './Socket.gateway'
import { EnvModule } from '@infra/env/Env.module'

@Module({
  imports: [EnvModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
