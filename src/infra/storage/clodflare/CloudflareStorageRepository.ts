import { Injectable } from '@nestjs/common'
import { StorageRepository } from '../contracts/StorageRepository'
import { CloudflareService } from './index.service'
import fs from 'fs'
import path from 'path'
import mime from 'mime-types'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { EnvService } from '@infra/env/Env.service'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { waitFor } from '@test/utils/waitFor'

@Injectable()
export class CloudflareStorageRepository implements StorageRepository {
  private readonly tmpDir = path.join(__dirname, '..', '..', '..', '..', 'temp')

  constructor(
    private readonly cloudflare: CloudflareService,
    private readonly env: EnvService,
  ) { }

  async upload(filename: string): Promise<string | null> {
    const filePath = path.join(this.tmpDir, filename)

    if (!fs.existsSync(filePath)) {
      return null
    }

    const file = fs.createReadStream(filePath)
    const ext = path.extname(filename)
    const uniqueId = new UniqueEntityId().toString()
    const mimetype = mime.lookup(filename)

    if (!mimetype) {
      return null
    }

    const filenameInBucket = `${ext.slice(1)}/${uniqueId}-${filename}`

    const command = new PutObjectCommand({
      Bucket: this.env.get('CLOUDFLARE_BUCKET'),
      Key: filenameInBucket,
      ContentType: mimetype,
      Body: file,
    })

    try {
      await this.cloudflare.r2.send(command)
    } catch (error) {
      console.log(error)

      return null
    }

    fs.rmSync(filePath)

    return filenameInBucket
  }
}
