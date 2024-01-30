import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import request from 'supertest'
import { AppModule } from '@infra/App.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { MakeCompany } from '@test/factories/modules/company/makeCompany'
import { Company } from '@modules/company/entities/Company'
import { ApiKey } from '@modules/company/entities/ApiKey'
import { MakeApiKey } from '@test/factories/modules/company/makeApiKey'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { Owner } from '@modules/owner/entities/Owner'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { User } from '@modules/user/entities/User'
import { MakeUser } from '@test/factories/modules/user/makeUser'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { HandleHashGenerator } from '@providers/cryptography/contracts/handleHashGenerator'
import { Market } from '../entities/Market'
import { MakeMarket } from '@test/factories/modules/market/makeMarket'
import { makeInventory } from '@test/factories/modules/inventory/makeInventory'

describe('Create market (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeCompany: MakeCompany
  let makeApiKey: MakeApiKey
  let makeUser: MakeUser
  let makeMarket: MakeMarket
  let user: User
  let owner: Owner
  let company: Company
  let market: Market
  let apiKey: ApiKey
  let encrypter: Encrypter
  let collaboratorAccessToken: string
  let hashGenerator: HashGenerator
  let handleHashGenerator: HandleHashGenerator

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeCompany, MakeApiKey, MakeUser, MakeMarket],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeCompany = moduleRef.get(MakeCompany)
    makeApiKey = moduleRef.get(MakeApiKey)
    makeUser = moduleRef.get(MakeUser)
    makeMarket = moduleRef.get(MakeMarket)

    encrypter = moduleRef.get(Encrypter)
    hashGenerator = moduleRef.get(HashGenerator)
    handleHashGenerator = moduleRef.get(HandleHashGenerator)

    user = await makeUser.create()

    const companyId = new UniqueEntityId()

    owner = makeOwner({ userId: user.id, companyId })

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

    collaboratorAccessToken = await encrypter.encrypt(
      {
        sub: owner.id.toString(),
        companyId: companyId.toString(),
        marketId: market.id.toString(),
        role: owner.role,
      },
      {
        algorithm: 'HS256',
        secret: apiKey.secret,
      },
    )

    await app.init()
  })

  test('[POST] /markets/collaborators [201]', async () => {
    const response = await request(app.getHttpServer())
      .post(`/markets/collaborators`)
      .set({
        'x-api-key': apiKey.key,
        'x-collaborator-access-token': collaboratorAccessToken,
      })
      .send({
        name: 'Jonas',
        email: 'jonas@jonas.com',
        password: '12345678',
        actualRemuneration: 100000,
        collaboratorRole: 'SELLER',
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Created)
    expect(response.headers).toEqual(
      expect.objectContaining({
        'x-location': expect.any(String),
      }),
    )

    const collaboratorOnDatabase = await prisma.collaborator.findFirst({
      where: {
        email: 'jonas@jonas.com',
        role: 'SELLER',
      },
    })

    expect(collaboratorOnDatabase).toBeTruthy()
  })
})
