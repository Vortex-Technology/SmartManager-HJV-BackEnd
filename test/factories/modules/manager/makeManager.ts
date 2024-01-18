import { fakerPT_BR } from '@faker-js/faker'
import {
  CollaboratorCreatePropsOptional,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { Manager } from '@modules/manager/entities/Manager'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeManager(
  override: Partial<
    CollaboratorCreatePropsOptional<CollaboratorRole.MANAGER>
  > = {},
  id?: UniqueEntityId,
): Manager {
  const manager = Manager.create(
    {
      email: fakerPT_BR.internet.email(),
      actualRemuneration: fakerPT_BR.number.int(),
      marketId: new UniqueEntityId(),
      userId: new UniqueEntityId(),
      password: fakerPT_BR.internet.password(),
      ...override,
    },
    id,
  )

  return manager
}

// @Injectable()
// export class MakeManager {
//   constructor(private readonly prisma: PrismaService) {}

//   async create(
//     override: Partial<
//       CollaboratorCreatePropsOptional<CollaboratorRole.MANAGER>
//     > = {},
//     id?: UniqueEntityId,
//   ) {
//     const manager = makeManager(override, id)

//     await this.prisma.collaborator.create({
//       data: ManagersPrismaMapper.toPrisma(manager),
//     })

//     return manager
//   }
// }
