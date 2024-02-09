import { Module } from '@nestjs/common'
import { CloudflareService } from './clodflare/index.service'
import { StorageRepository } from './contracts/StorageRepository'
import { CloudflareStorageRepository } from './clodflare/CloudflareStorageRepository'
import { EnvModule } from '@infra/env/Env.module'

@Module({
  providers: [
    CloudflareService,
    {
      provide: StorageRepository,
      useClass: CloudflareStorageRepository,
    },
  ],
  exports: [StorageRepository],
  imports: [EnvModule],
})
export class StorageModule { }
