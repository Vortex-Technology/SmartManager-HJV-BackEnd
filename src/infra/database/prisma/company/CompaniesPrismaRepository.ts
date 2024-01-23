import { Company } from '@modules/company/entities/Company'
import { CompaniesRepository } from '@modules/company/repositories/CompaniesRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../index.service'
import { MarketsRepository } from '@modules/market/repositories/MarketsRepository'
import { CompaniesPrismaMapper } from './CompaniesPrismaMapper'

@Injectable()
export class CompaniesPrismaRepository implements CompaniesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly marketsRepository: MarketsRepository,
  ) {}

  async create(company: Company): Promise<void> {
    await this.prisma.company.create({
      data: CompaniesPrismaMapper.toCreatePrisma(company),
    })

    const markets = company.markets?.getNewItems()

    if (markets) {
      await this.marketsRepository.createMany(markets)
    }
  }

  async findById(companyId: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
      include: {
        address: true,
        owner: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!company) return null

    return CompaniesPrismaMapper.toEntity(company)
  }

  async save(company: Company): Promise<void> {
    await this.prisma.company.update({
      where: {
        id: company.id.toString(),
      },
      data: CompaniesPrismaMapper.toUpdatePrisma(company),
    })

    const markets = company.markets?.getNewItems()

    if (markets) {
      await this.marketsRepository.createMany(markets)
    }
  }

  async findByIdWithOwner(companyId: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
      include: {
        address: true,
        owner: true,
      },
    })

    if (!company) return null

    return CompaniesPrismaMapper.toEntity(company)
  }
}
