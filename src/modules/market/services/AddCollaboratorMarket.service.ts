import { UsersRepository } from '@modules/user/repositories/UsersRepository'
import { Injectable } from '@nestjs/common'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { Either, left, right } from '@shared/core/error/Either'
import { MarketsRepository } from '../repositories/MarketsRepository'
import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { MarketNotFound } from '../errors/MarketNorFound'
import { User } from '@modules/user/entities/User'
import { MarketCollaboratorsList } from '../entities/MarketCollaboratorsList'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { TransactorService } from '@infra/database/transactor/contracts/TransactorService'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'

interface Request {
  name: string
  image?: string
  email: string
  password: string
  actualRemuneration: number
  collaboratorRole: CollaboratorRole
  companyId: string
  marketId: string
  creatorId: string
}

type Response = Either<
  PermissionDenied | CompanyNotFound | MarketNotFound | CollaboratorNotFound,
  {
    collaborator: Collaborator
  }
>

@Injectable()
export class AddCollaboratorMarketService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly marketsRepository: MarketsRepository,
    private readonly hasherGenerator: HashGenerator,
    private readonly transactorService: TransactorService,
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInMarketService,
  ) {}

  async execute({
    name,
    image,
    email,
    marketId,
    password,
    companyId,
    collaboratorRole,
    actualRemuneration,
    creatorId,
  }: Request): Promise<Response> {
    const response = await this.verifyPermissions.execute({
      acceptedRoles: [CollaboratorRole.MANAGER, CollaboratorRole.OWNER],
      collaboratorId: creatorId,
      companyId,
      marketId,
    })

    if (response.isLeft()) return left(response.value)

    const { market } = response.value

    if (
      collaboratorRole === CollaboratorRole.OWNER ||
      collaboratorRole === CollaboratorRole.NOT_DEFINED
    ) {
      return left(new PermissionDenied())
    }

    const collaboratorExistAsUser =
      await this.usersRepository.findByEmail(email)

    let userOfCollaborator = collaboratorExistAsUser
    const passwordHash = await this.hasherGenerator.hash(password)

    const transactor = this.transactorService.start()

    if (!userOfCollaborator) {
      const newUser = User.create({
        email,
        name,
        password: passwordHash,
        image,
      })

      userOfCollaborator = newUser

      transactor.add((ex) => this.usersRepository.create(newUser, ex))
    }

    const collaborator = Collaborator.createUntyped({
      actualRemuneration,
      email,
      marketId: market.id,
      password: passwordHash,
      userId: userOfCollaborator.id,
      role: collaboratorRole,
    })

    market.collaborators = new MarketCollaboratorsList()
    market.collaborators.add(collaborator)

    transactor.add((ex) => this.marketsRepository.save(market, ex))

    await this.transactorService.execute(transactor)

    return right({
      collaborator,
    })
  }
}
