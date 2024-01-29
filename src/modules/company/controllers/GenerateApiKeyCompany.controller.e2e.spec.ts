import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { MakeUser } from '@test/factories/modules/user/makeUser'
import { AppModule } from '@infra/App.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { PrismaService } from '@infra/database/prisma/index.service'
import { User } from '@modules/user/entities/User'
import { EnvModule } from '@infra/env/Env.module'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import request from 'supertest'
import { statusCode } from '@config/statusCode'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Owner } from '@modules/owner/entities/Owner'
import { Company } from '../entities/Company'
import { MakeCompany } from '@test/factories/modules/company/makeCompany'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'

describe('Generate api key company (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  let encrypter: Encrypter

  let makeUser: MakeUser
  let makeCompany: MakeCompany

  let token: string
  let owner: Owner
  let user: User
  let company: Company

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule, EnvModule],
      providers: [MakeUser, MakeCompany],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    encrypter = moduleRef.get(Encrypter)

    makeUser = moduleRef.get(MakeUser)
    makeCompany = moduleRef.get(MakeCompany)

    const companyId = new UniqueEntityId()
    user = await makeUser.create()
    owner = makeOwner({ userId: user.id, companyId })

    company = await makeCompany.create(
      {
        founderId: user.id,
        ownerId: owner.id,
        owner,
      },
      companyId,
    )

    token = await encrypter.encrypt({
      sub: user.id.toString(),
    })

    await app.init()
  })

  test('[GET] /companies/:companyId/apiKeys/generate [201]', async () => {
    const response = await request(app.getHttpServer())
      .post(`/companies/${company.id.toString()}/apiKeys/generate`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Created)
    expect(response.headers['x-location']).toEqual(expect.any(String))
    expect(response.headers['x-api-key']).toEqual(expect.any(String))

    const apiKeyOnDatabase = await prisma.apiKey.count({
      where: {
        companyId: company.id.toString(),
      },
    })

    expect(apiKeyOnDatabase).toEqual(1)
  })
})
