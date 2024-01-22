import { Env } from '..'

export abstract class EnvServiceContract {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract get<T extends keyof Env>(key: T): any
}
