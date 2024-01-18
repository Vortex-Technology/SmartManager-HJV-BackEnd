import { Either, left, right } from '@shared/core/error/Either'
import { SessionExpired } from '../errors/SessionExpired'
import { Injectable } from '@nestjs/common'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { Decoder } from '@providers/cryptography/contracts/decoder'
import { AdministratorRepository } from '@modules/administrator/repositories/AdministratorRepository'
import { SellerRepository } from '@modules/seller/repositories/SellerRepository'
import { AttendantRepository } from '@modules/attendant/repositories/AttendantRepository'
import { CollaboratorNotFound } from '../errors/CollaboratorNotFound'
import { DateVerifications } from '@providers/date/contracts/dateVerifications'
import { Administrator } from '@modules/administrator/entities/Administrator'
import { RefreshToken } from '../entities/RefreshToken'
import { DateAddition } from '@providers/date/contracts/dateAddition'
import { RefreshTokensRepository } from '../repositories/RefreshTokensRepository'
import { EnvService } from '@infra/env/Env.service'

interface Request {
  refreshToken: string
}

type Response = Either<
  SessionExpired | CollaboratorNotFound,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly administratorRepository: AdministratorRepository,
    private readonly refreshTokenRepository: RefreshTokensRepository,
    private readonly attendantRepository: AttendantRepository,
    private readonly dateVerifications: DateVerifications,
    private readonly sellerRepository: SellerRepository,
    private readonly dateAddition: DateAddition,
    private readonly encrypter: Encrypter,
    private readonly decoder: Decoder,
    private readonly env: EnvService,
  ) {}

  async execute({ refreshToken }: Request): Promise<Response> {
    const { isValid, payload } = await this.decoder.decrypt(refreshToken)

    if (!isValid) {
      return left(new SessionExpired())
    }

    if (!payload) {
      return left(new SessionExpired())
    }

    const { sub, type } = payload
    const findCollaboratorMapper = {
      ADMINISTRATOR: (id: string) => this.administratorRepository.findById(id),
      SELLER: (id: string) => this.sellerRepository.findById(id),
      ATTENDANT: (id: string) => this.attendantRepository.findById(id),
    }

    if (!findCollaboratorMapper[type]) {
      return left(new CollaboratorNotFound(type.toLocaleLowerCase()))
    }

    const collaborator = await findCollaboratorMapper[type](sub)

    if (!collaborator) {
      return left(new CollaboratorNotFound(type.toLocaleLowerCase()))
    }

    const collaboratorToken =
      await this.refreshTokenRepository.findByCollaboratorIdAndRefreshToken({
        collaboratorId: collaborator.id.toString(),
        refreshToken,
      })

    if (!collaboratorToken) {
      return left(new SessionExpired())
    }

    const tokenIsNotExpired = this.dateVerifications.isBefore({
      endDate: collaboratorToken.expiresIn,
    })

    await this.refreshTokenRepository.permanentlyDeleteByCollaboratorId(
      collaborator.id.toString(),
    )

    if (!tokenIsNotExpired) {
      return left(new SessionExpired())
    }

    const jwtRefreshExpires =
      collaborator instanceof Administrator
        ? this.env.get('JWT_ADM_REFRESH_EXPIRES_IN')
        : this.env.get('JWT_USER_REFRESH_EXPIRES_IN')

    const refreshExpires =
      collaborator instanceof Administrator
        ? this.env.get('ADM_REFRESH_EXPIRES_IN')
        : this.env.get('USER_REFRESH_EXPIRES_IN')

    const jwtAccessExpires =
      collaborator instanceof Administrator
        ? this.env.get('JWT_ADM_ACCESS_EXPIRES_IN')
        : this.env.get('JWT_USER_ACCESS_EXPIRES_IN')

    const revalidatedRefreshToken = await this.encrypter.encrypt(
      {
        sub: collaborator.id.toString(),
        type,
        role:
          collaborator instanceof Administrator ? collaborator.role : undefined,
      },
      {
        expiresIn: jwtRefreshExpires,
      },
    )

    const accessToken = await this.encrypter.encrypt(
      {
        sub: collaborator.id.toString(),
        type,
        role:
          collaborator instanceof Administrator ? collaborator.role : undefined,
      },
      {
        expiresIn: jwtAccessExpires,
      },
    )

    const newRefreshToken = RefreshToken.create({
      collaboratorId: collaborator.id,
      token: revalidatedRefreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(refreshExpires),
    })

    await this.refreshTokenRepository.create(newRefreshToken)

    return right({
      accessToken,
      refreshToken: revalidatedRefreshToken,
    })
  }
}
