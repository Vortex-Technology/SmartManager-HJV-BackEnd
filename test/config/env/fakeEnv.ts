import { Env, envSchema } from '@infra/env'
import { EnvServiceContract } from '@infra/env/contracts/envServiceContract'

export class FakeEnv implements EnvServiceContract {
  get<T extends keyof Env>(key: T) {
    const env = envSchema.parse(process.env)
    return env[key]
  }
}
