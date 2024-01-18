import { Company } from '@modules/company/entities/Company'
import { CompaniesRepository } from '@modules/company/repositories/CompaniesRepository'
import { MarketsInMemoryRepository } from '../market/MarketsInMemoryRepository'

export class CompaniesInMemoryRepository implements CompaniesRepository {
  constructor(
    private readonly marketsInMemoryRepository: MarketsInMemoryRepository,
  ) {}

  companies: Company[] = []

  async create(company: Company): Promise<void> {
    this.companies.push(company)

    const markets = company.markets?.getNewItems()

    if (markets) {
      await this.marketsInMemoryRepository.createMany(markets)
    }
  }

  async findById(companyId: string): Promise<Company | null> {
    const company = this.companies.find(
      (company) => company.id.toString() === companyId,
    )

    if (!company) return null

    return company
  }

  async save(company: Company): Promise<void> {
    const companyIndex = this.companies.findIndex((company) =>
      company.equals(company),
    )

    if (companyIndex === -1) {
      throw new Error('Make sure you already create company')
    }

    this.companies[companyIndex] = company

    const markets = company.markets?.getNewItems()

    if (markets) {
      await this.marketsInMemoryRepository.createMany(markets)
    }
  }
}
