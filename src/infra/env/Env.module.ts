import { Module } from '@nestjs/common'
import { EnvService } from './Env.service'

@Module({
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
