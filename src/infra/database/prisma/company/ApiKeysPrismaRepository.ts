import { ApiKeysRepository } from '@modules/company/repositories/ApiKeysRepository'
import { PrismaService } from '../index.service'
import { ApiKeysPrismaMapper } from './ApiKeysPrismaMapper'
import { Injectable } from '@nestjs/common'
import { ApiKey } from '@modules/company/entities/ApiKey'

@Injectable()
export class ApiKeysPrismaRepository implements ApiKeysRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(apiKey: ApiKey): Promise<void> {
    await this.prisma.apiKey.create({
      data: ApiKeysPrismaMapper.toPrisma(apiKey),
    })
  }

  async findActivesByCompanyId(companyId: string): Promise<ApiKey[]> {
    const apiKey = await this.prisma.apiKey.findMany({
      where: {
        revokedAt: null,
        companyId,
      },
    })

    return apiKey.map(ApiKeysPrismaMapper.toEntity)
  }

  async findByKey(key: string): Promise<ApiKey | null> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: {
        key,
      },
    })

    if (!apiKey) return null

    return ApiKeysPrismaMapper.toEntity(apiKey)
  }
}
