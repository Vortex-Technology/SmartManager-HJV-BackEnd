import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import request from 'supertest'
import { AppModule } from '@infra/App.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { Owner } from '@modules/owner/entities/Owner'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { HandleHashGenerator } from '@providers/cryptography/contracts/handleHashGenerator'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { MakeApiKey } from '@test/factories/modules/company/makeApiKey'
import { MakeCompany } from '@test/factories/modules/company/makeCompany'
import { makeInventory } from '@test/factories/modules/inventory/makeInventory'
import { MakeMarket } from '@test/factories/modules/market/makeMarket'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'
import { MakeUser } from '@test/factories/modules/user/makeUser'
import { User } from '@modules/user/entities/User'
import { Company } from '@modules/company/entities/Company'
import { Market } from '@modules/market/entities/Market'
import { ApiKey } from '@modules/company/entities/ApiKey'

describe('Login collaborator (E2E)', () => {
  let app: INestApplication

  let makeCompany: MakeCompany
  let makeApiKey: MakeApiKey
  let makeUser: MakeUser
  let makeMarket: MakeMarket

  let handleHashGenerator: HandleHashGenerator
  let hashGenerator: HashGenerator

  let user: User
  let owner: Owner
  let company: Company
  let market: Market
  let apiKey: ApiKey

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeCompany, MakeApiKey, MakeUser, MakeMarket],
    }).compile()

    app = moduleRef.createNestApplication()
    makeCompany = moduleRef.get(MakeCompany)
    makeApiKey = moduleRef.get(MakeApiKey)
    makeUser = moduleRef.get(MakeUser)
    makeMarket = moduleRef.get(MakeMarket)

    hashGenerator = moduleRef.get(HashGenerator)
    handleHashGenerator = moduleRef.get(HandleHashGenerator)

    user = await makeUser.create()

    const companyId = new UniqueEntityId()
    const hashedPassword = await hashGenerator.hash('12345678')

    owner = makeOwner({
      userId: user.id,
      companyId,
      email: 'jonas@jonas.com',
      password: hashedPassword,
    })

    company = await makeCompany.create(
      {
        founderId: user.id,
        ownerId: owner.id,
        owner,
      },
      companyId,
    )

    market = await makeMarket.create({
      companyId,
      inventory: makeInventory({
        companyId,
      }),
    })

    const secret = await handleHashGenerator.handleHash()
    const key = await hashGenerator.hash(company.companyName + secret)

    apiKey = await makeApiKey.create({
      companyId,
      key,
      secret,
    })

    await app.init()
  })

  test('[POST] /companies/:companyId/markets/:marketId/collaborators/login [201]', async () => {
    const response = await request(app.getHttpServer())
      .post(
        `/companies/${company.id.toString()}/markets/${market.id.toString()}/collaborators/login`,
      )
      .set({
        'x-api-key': apiKey.key,
      })
      .send({
        email: 'jonas@jonas.com',
        password: '12345678',
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Created)
    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    )
  })
})
