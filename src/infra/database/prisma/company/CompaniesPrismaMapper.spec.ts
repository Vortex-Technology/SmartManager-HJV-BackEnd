import {
  CompaniesPrismaMapper,
  CompanyWithAddressAndOwnerIdPrisma,
} from './CompaniesPrismaMapper'
import {
  Company,
  CompanyDocumentationType,
  CompanyStatus,
} from '@modules/company/entities/Company'
import { Owner } from '@modules/owner/entities/Owner'
import { Address } from '@shared/core/valueObjects/Address'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

describe('Company prisma mapper', () => {
  it('Should be able to map a company to entity', () => {
    const company: CompanyWithAddressAndOwnerIdPrisma = {
      id: 'company-1',
      addressId: 1,
      address: {
        id: 1,
        city: 'San Francisco',
        country: 'CA',
        complement: 'complement',
        neighborhood: 'vile',
        number: '1',
        postalCode: '123',
        state: 'San Francisco',
        street: 'San vile',
      },
      createdAt: new Date(),
      companyNane: 'company-name',
      deletedAt: new Date(),
      documentationType: 'IE',
      documentation: 'documentation',
      email: 'company-name@example.com',
      founderId: 'founder-1',
      owner: { id: 'owner-1' },
      startedIssueInvoicesAt: null,
      sector: 'sector',
      stateRegistration: 'state-registration',
      status: 'ACTIVE',
      updatedAt: new Date(),
    }

    const founderId = new UniqueEntityId('founder-1')
    const companyId = new UniqueEntityId('company-1')
    const ownerId = new UniqueEntityId('owner-1')

    const result = CompaniesPrismaMapper.toEntity(company)

    expect(result).toBeInstanceOf(Company)
    expect(result.id.equals(companyId)).toBe(true)
    expect(result.ownerId.equals(ownerId)).toBe(true)
    expect(result.owner).toBe(null)
    expect(result.founderId.equals(founderId)).toBe(true)
    expect(result.documentation).toBe('documentation')
    expect(result.companyName).toBe('company-name')
    expect(result.documentationType).toBe(CompanyDocumentationType.IE)
    expect(result.email).toBe('company-name@example.com')
    expect(result.startedIssueInvoicesAt).toBe(null)
    expect(result.stateRegistration).toBe('state-registration')
    expect(result.status).toBe(CompanyStatus.ACTIVE)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.sector).toBe('sector')
  })

  it('should be able to map company to create to prisma', () => {
    const company = Company.create({
      address: Address.create({
        city: 'San Francisco',
        neighborhood: 'Francisco',
        country: 'USA',
        number: '1',
        street: 'Street 1',
        state: 'Califonia',
        postalCode: '0090900',
        complement: 'complement',
      }),
      companyName: 'company',
      founderId: new UniqueEntityId('founder-1'),
      ownerId: new UniqueEntityId('owner-1'),
      sector: 'sector',
      createdAt: new Date(),
      deletedAt: new Date(),
      updatedAt: new Date(),
      documentation: 'documentation',
      documentationType: CompanyDocumentationType.LE,
      email: 'email@example.com',
      markets: null,
      owner: Owner.create(
        {
          actualRemuneration: 1,
          companyId: new UniqueEntityId('company-1'),
          email: 'email@example.com',
          password: 'password',
          userId: new UniqueEntityId('user-1'),
          createdAt: new Date(),
          deletedAt: new Date(),
          inactivatedAt: new Date(),
          marketId: new UniqueEntityId('market-1'),
          updatedAt: new Date(),
        },
        new UniqueEntityId('ownerId-1'),
      ),
      startedIssueInvoicesAt: new Date(),
      stateRegistration: 'EUA',
      status: CompanyStatus.INACTIVE,
    })
    const result = CompaniesPrismaMapper.toCreatePrisma(company)
    const founderId = new UniqueEntityId('founder-1')
    const ownerId = new UniqueEntityId('ownerId-1')

    expect(result.address.create).toEqual(
      expect.objectContaining({
        city: 'San Francisco',
        neighborhood: 'Francisco',
        country: 'USA',
        number: '1',
        street: 'Street 1',
        state: 'Califonia',
        postalCode: '0090900',
        complement: 'complement',
      }),
    )
    expect(result.companyNane).toEqual('company')
    expect(result.email).toEqual('email@example.com')
    expect(result.documentation).toEqual('documentation')
    expect(result.documentationType).toEqual(CompanyDocumentationType.LE)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.sector).toEqual('sector')
    expect(result.stateRegistration).toEqual('EUA')
    expect(result.startedIssueInvoicesAt).toBeInstanceOf(Date)
    expect(result.founder.connect?.id).toBe(founderId.toString())
    expect(result.owner?.create?.id).toBe(ownerId.toString())
    expect(result.status).toBe(CompanyStatus.INACTIVE)
  })

  it('should be able to to update to prisma map', () => {
    const companyUpdated = Company.create({
      address: Address.create({
        city: 'San Francisco',
        neighborhood: 'Francisco',
        country: 'USA',
        number: '1',
        street: 'Street 1',
        state: 'Califonia',
        postalCode: '0090900',
        complement: 'complement',
      }),
      companyName: 'company',
      founderId: new UniqueEntityId('founder-1'),
      ownerId: new UniqueEntityId('owner-1'),
      sector: 'sector',
      createdAt: new Date(),
      deletedAt: new Date(),
      updatedAt: new Date(),
      documentation: 'documentation',
      documentationType: CompanyDocumentationType.LE,
      email: 'email@example.com',
      markets: null,
      owner: Owner.create(
        {
          actualRemuneration: 1,
          companyId: new UniqueEntityId('company-1'),
          email: 'email@example.com',
          password: 'password',
          userId: new UniqueEntityId('user-1'),
          createdAt: new Date(),
          deletedAt: new Date(),
          inactivatedAt: new Date(),
          marketId: new UniqueEntityId('market-1'),
          updatedAt: new Date(),
        },
        new UniqueEntityId('ownerId-1'),
      ),
      startedIssueInvoicesAt: new Date(),
      stateRegistration: 'EUA',
      status: CompanyStatus.INACTIVE,
    })

    const result = CompaniesPrismaMapper.toUpdatePrisma(companyUpdated)

    expect(result.companyNane).toEqual('company')
    expect(result.email).toEqual('email@example.com')
    expect(result.documentation).toEqual('documentation')
    expect(result.documentationType).toEqual(CompanyDocumentationType.LE)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.sector).toEqual('sector')
    expect(result.stateRegistration).toEqual('EUA')
    expect(result.startedIssueInvoicesAt).toBeInstanceOf(Date)
    expect(result.status).toBe(CompanyStatus.INACTIVE)
  })

  it('not should be able to map to company without address ownerId to prisma', () => {
    const company: CompanyWithAddressAndOwnerIdPrisma = {
      id: 'company-1',
      addressId: 1,
      address: {
        id: 1,
        city: 'San Francisco',
        country: 'CA',
        complement: 'complement',
        neighborhood: 'vile',
        number: '1',
        postalCode: '123',
        state: 'San Francisco',
        street: 'San vile',
      },
      createdAt: new Date(),
      companyNane: 'company-name',
      deletedAt: new Date(),
      documentationType: 'IE',
      documentation: 'documentation',
      email: 'company-name@example.com',
      founderId: 'founder-1',
      owner: null,
      startedIssueInvoicesAt: null,
      sector: 'sector',
      stateRegistration: 'state-registration',
      status: 'ACTIVE',
      updatedAt: new Date(),
    }

    expect(async () => {
      CompaniesPrismaMapper.toEntity(company)
    })
      .rejects.toBeInstanceOf(Error)
      .catch((err) => {
        throw err
      })
  })

  it('not should be able to map company to create prisma if owner not set', () => {
    const company = Company.create({
      address: Address.create({
        city: 'San Francisco',
        neighborhood: 'Francisco',
        country: 'USA',
        number: '1',
        street: 'Street 1',
        state: 'Califonia',
        postalCode: '0090900',
        complement: 'complement',
      }),
      companyName: 'company',
      founderId: new UniqueEntityId('founder-1'),
      ownerId: new UniqueEntityId('owner-1'),
      sector: 'sector',
      createdAt: new Date(),
      deletedAt: new Date(),
      updatedAt: new Date(),
      documentation: 'documentation',
      documentationType: CompanyDocumentationType.LE,
      email: 'email@example.com',
      markets: null,
      startedIssueInvoicesAt: new Date(),
      stateRegistration: 'EUA',
      status: CompanyStatus.INACTIVE,
    })

    expect(async () => {
      CompaniesPrismaMapper.toCreatePrisma(company)
    })
      .rejects.toBeInstanceOf(Error)
      .catch((err) => {
        throw err
      })
  })

  it('not should be able to map to entity if owner not exist in company', () => {
    const company: CompanyWithAddressAndOwnerIdPrisma = {
      id: 'company-1',
      addressId: 1,
      address: {
        id: 1,
        city: 'San Francisco',
        country: 'CA',
        complement: 'complement',
        neighborhood: 'vile',
        number: '1',
        postalCode: '123',
        state: 'San Francisco',
        street: 'San vile',
      },
      createdAt: new Date(),
      companyNane: 'company-name',
      deletedAt: new Date(),
      documentationType: 'IE',
      documentation: 'documentation',
      email: 'company-name@example.com',
      founderId: 'founder-1',
      owner: null,
      startedIssueInvoicesAt: null,
      sector: 'sector',
      stateRegistration: 'state-registration',
      status: 'ACTIVE',
      updatedAt: new Date(),
    }
    expect(async () => {
      CompaniesPrismaMapper.toEntity(company)
    })
      .rejects.toBeInstanceOf(Error)
      .catch((err) => {
        throw err
      })
  })
})
