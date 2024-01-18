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
import { CollaboratorNotFound } from '@modules/refreshToken/errors/CollaboratorNotFound'

interface Request {
  name: string
  image?: string
  email: string
  password: string
  actualRemuneration: number
  collaboratorRole: CollaboratorRole
  creatorId: string
  companyId: string
  marketId: string
}

type Response = Either<
  CollaboratorNotFound | PermissionDenied | CompanyNotFound | MarketNotFound,
  {
    collaborator: Collaborator
  }
>

@Injectable()
export class AddCollaboratorPerCollaboratorService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly companiesRepository: CompaniesRepository,
    private readonly marketsRepository: MarketsRepository,
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly hasherGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    image,
    email,
    creatorId,
    marketId,
    password,
    companyId,
    collaboratorRole,
    actualRemuneration,
  }: Request): Promise<Response> {
    const acceptCreationForRoles = [CollaboratorRole.MANAGER]

    const creator = await this.collaboratorsRepository.findById(creatorId)

    if (!creator) {
      return left(new CollaboratorNotFound(CollaboratorRole.MANAGER))
    }

    if (!acceptCreationForRoles.includes(creator.role)) {
      return left(new PermissionDenied())
    }

    const company = await this.companiesRepository.findById(companyId)

    if (!company) {
      return left(new CompanyNotFound())
    }

    const market = await this.marketsRepository.findById(marketId)

    if (!market) {
      return left(new MarketNotFound())
    }

    if (!creator.marketId.equals(market.id)) {
      return left(new PermissionDenied())
    }

    const collaboratorExistAsUser =
      await this.usersRepository.findByEmail(email)

    let userOfCollaborator = collaboratorExistAsUser
    const passwordHash = await this.hasherGenerator.hash(password)

    if (!userOfCollaborator) {
      userOfCollaborator = User.create({
        email,
        name,
        password: passwordHash,
        image,
      })

      await this.usersRepository.create(userOfCollaborator)
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

    await this.marketsRepository.save(market)

    return right({
      collaborator,
    })
  }
}