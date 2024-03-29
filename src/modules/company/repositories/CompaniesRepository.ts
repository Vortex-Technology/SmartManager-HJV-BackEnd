import { Company } from '../entities/Company'

export abstract class CompaniesRepository {
  abstract create(company: Company): Promise<void>
  abstract findById(companyId: string): Promise<Company | null>
  abstract findByIdAndFounderId(
    companyId: string,
    founderId: string,
  ): Promise<Company | null>

  abstract findByIdWithOwner(companyId: string): Promise<Company | null>
  abstract save(company: Company): Promise<void>
}
