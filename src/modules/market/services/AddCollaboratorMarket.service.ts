import { CompaniesRepository } from '@modules/company/repositories/CompaniesRepository'
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
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { TransactorService } from '@infra/database/transactor/contracts/TransactorService'

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
    private readonly companiesRepository: CompaniesRepository,
    private readonly marketsRepository: MarketsRepository,
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly hasherGenerator: HashGenerator,
    private readonly transactorService: TransactorService,
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
    const acceptCreationForRoles = [
      CollaboratorRole.MANAGER,
      CollaboratorRole.OWNER,
    ]

    const creator = await this.collaboratorsRepository.findById(creatorId)
    if (!creator) {
      return left(new CollaboratorNotFound())
    }

    const company = await this.companiesRepository.findById(companyId)
    if (!company) {
      return left(new CompanyNotFound())
    }

    const market = await this.marketsRepository.findById(marketId)
    if (!market) {
      return left(new MarketNotFound())
    }

    if (
      !creator.marketId?.equals(market.id) &&
      !creator.companyId?.equals(company.id)
    ) {
      return left(new PermissionDenied())
    }

    if (!acceptCreationForRoles.includes(creator.role)) {
      return left(new PermissionDenied())
    }

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
