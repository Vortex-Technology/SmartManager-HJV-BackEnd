import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Env } from '.'
import { EnvServiceContract } from './contracts/envServiceContract'

@Injectable()
export class EnvService implements EnvServiceContract {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T) {
    return this.configService.get(key, { infer: true })
  }
}
