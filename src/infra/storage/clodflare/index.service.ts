import { S3Client } from '@aws-sdk/client-s3'
import { EnvService } from '@infra/env/Env.service'
import { Injectable, OnModuleDestroy } from '@nestjs/common'

@Injectable()
export class CloudflareService implements OnModuleDestroy {
  r2: S3Client

  constructor(private readonly env: EnvService) {
    this.r2 = new S3Client({
      region: 'auto',
      endpoint: this.env.get('CLOUDFLARE_END_POINT'),
      credentials: {
        accessKeyId: this.env.get('CLOUDFLARE_ACCESS_KEY_ID'),
        secretAccessKey: this.env.get('CLOUDFLARE_ACCESS_KEY'),
      },
    })
  }

  onModuleDestroy() {
    this.r2.destroy()
  }
}
