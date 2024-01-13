import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { CollaboratorsRepository } from '../repositories/CollaboratorsRepository'
import { HashComparer } from '@providers/cryptography/contracts/hashComparer'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { EnvService } from '@infra/env/env.service'
import { DateAddition } from '@providers/date/contracts/dateAddition'
import { RefreshTokenRepository } from '@modules/refreshToken/repositories/RefreshTokenRepository'
import { RefreshToken } from '@modules/refreshToken/entities/RefreshToken'
import { CollaboratorWrongCredentials } from '../errors/CollaboratorWrongCredentials'

interface Request {
  login: string
  password: string
}

type Response = Either<
  CollaboratorWrongCredentials,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class LoginCollaboratorService {
  constructor(
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly env: EnvService,
    private readonly dateAddition: DateAddition,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({ login, password }: Request): Promise<Response> {
    const collaborator = await this.collaboratorsRepository.findByLogin(login)

    if (!collaborator) {
      return left(new CollaboratorWrongCredentials())
    }

    const passwordMatch = await this.hashComparer.compare(
      password,
      collaborator.password,
    )

    if (!passwordMatch) {
      return left(new CollaboratorWrongCredentials())
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: collaborator.id.toString(),
        role: collaborator.role,
      },
      {
        expiresIn: this.env.get('JWT_ADM_ACCESS_EXPIRES_IN'),
      },
    )

    const _refreshToken = await this.encrypter.encrypt(
      {
        sub: collaborator.id.toString(),
        role: collaborator.role,
      },
      {
        expiresIn: this.env.get('JWT_ADM_REFRESH_EXPIRES_IN'),
      },
    )

    const refreshToken = RefreshToken.create({
      collaboratorId: collaborator.id,
      token: _refreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(
        this.env.get('ADM_REFRESH_EXPIRES_IN'),
      ),
    })

    await this.refreshTokenRepository.create(refreshToken)

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    })
  }
}
