import { fakerPT_BR } from '@faker-js/faker'
import { Company, CompanyProps } from '@modules/company/entities/Company'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeCompany(
  override: Partial<CompanyProps> = {},
  id?: UniqueEntityId,
): Company {
  const company = Company.create(
    {
      companyName: fakerPT_BR.company.name(),
      ownerId: new UniqueEntityId(),
      sector: 'IT',
      ...override,
    },
    id,
  )

  return company
}

// @Injectable()
// export class MakeCompany {
//   constructor(private readonly prisma: PrismaService) {}

//   async create(
//     override: Partial<
//       CollaboratorCreatePropsOptional<CollaboratorRole.COMPANY>
//     > = {},
//     id?: UniqueEntityId,
//   ) {
//     const company = makeCompany(override, id)

//     await this.prisma.collaborator.create({
//       data: CompanysPrismaMapper.toPrisma(company),
//     })

//     return company
//   }
// }
