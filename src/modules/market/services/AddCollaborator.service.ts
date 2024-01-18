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
import { MissingInformations } from '@shared/errors/MissingInformations'
import { CollaboratorNotFound } from '@modules/refreshToken/errors/CollaboratorNotFound'
import { Company } from '@modules/company/entities/Company'
import { Market } from '../entities/Market'
import { UserNotFount } from '@modules/user/errors/UserNotFound'

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
  creatorType: 'OWNER' | 'COLLABORATOR'
}

type Response = Either<
  | UserNotFount
  | PermissionDenied
  | CompanyNotFound
  | MarketNotFound
  | MissingInformations
  | CollaboratorNotFound,
  {
    collaborator: Collaborator
  }
>

function verifyForOwner(
  owner: User | null,
  company: Company | null,
  market: Market | null,
): Either<
  UserNotFount | CompanyNotFound | PermissionDenied | MarketNotFound,
  true
> {
  if (!owner) {
    return left(new UserNotFount())
  }

  if (!company) {
    return left(new CompanyNotFound())
  }

  if (!company.ownerId.equals(owner.id)) {
    return left(new PermissionDenied())
  }

  if (!market) return left(new MarketNotFound())

  return right(true)
}

function verifyForCollaborator(
  collaborator: Collaborator | null,
  company: Company | null,
  market: Market | null,
): Either<CollaboratorNotFound | MarketNotFound | PermissionDenied, true> {
  const acceptCreationForRoles = [CollaboratorRole.MANAGER]

  if (!collaborator) {
    return left(new CollaboratorNotFound(CollaboratorRole.MANAGER))
  }

  if (!company) {
    return left(new CompanyNotFound())
  }

  if (!market) {
    return left(new MarketNotFound())
  }

  if (!collaborator.marketId.equals(market.id)) {
    return left(new PermissionDenied())
  }

  if (!acceptCreationForRoles.includes(collaborator.role)) {
    return left(new PermissionDenied())
  }

  return right(true)
}

const verificationMapper = {
  OWNER: verifyForOwner,
  COLLABORATOR: verifyForCollaborator,
}

@Injectable()
export class AddCollaboratorService {
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
    marketId,
    password,
    companyId,
    collaboratorRole,
    actualRemuneration,
    creatorId,
    creatorType,
  }: Request): Promise<Response> {
    const isOwner = creatorType === 'OWNER'

    const creator = isOwner
      ? await this.usersRepository.findById(creatorId)
      : await this.collaboratorsRepository.findById(creatorId)

    const company = await this.companiesRepository.findById(companyId)
    const market = await this.marketsRepository.findById(marketId)

    const verification = verificationMapper[creatorType](
      creator as (User & Collaborator) | null,
      company,
      market,
    )

    if (verification.isLeft()) return left(verification.value)

    if (!market) {
      return left(new MarketNotFound())
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
