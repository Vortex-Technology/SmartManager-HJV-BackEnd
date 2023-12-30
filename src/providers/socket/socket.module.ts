import { Module } from '@nestjs/common'
import { SocketGateway } from './socket.gateway'
import { EnvModule } from '@infra/env/env.module'

@Module({
  imports: [EnvModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
