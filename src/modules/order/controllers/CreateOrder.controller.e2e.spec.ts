import request from 'supertest'
import { AppModule } from '@infra/App.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { PrismaService } from '@infra/database/prisma/index.service'
import { ApiKey } from '@modules/company/entities/ApiKey'
import { Company } from '@modules/company/entities/Company'
import { Inventory } from '@modules/inventory/entities/Inventory'
import { Market } from '@modules/market/entities/Market'
import { Owner } from '@modules/owner/entities/Owner'
import { User } from '@modules/user/entities/User'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
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
import { statusCode } from '@config/statusCode'

describe('Create Order (E2E)', async () => {
  let app: INestApplication
  let prisma: PrismaService

  let makeCompany: MakeCompany
  let makeApiKey: MakeApiKey
  let makeUser: MakeUser
  let makeMarket: MakeMarket

  let encrypter: Encrypter
  let handleHashGenerator: HandleHashGenerator
  let hashGenerator: HashGenerator

  let user: User
  let owner: Owner
  let company: Company
  let market: Market
  let apiKey: ApiKey
  let inventory: Inventory

  let collaboratorAccessToken: string

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

    inventory = makeInventory({
      companyId,
    })

    market = await makeMarket.create({
      companyId,
      inventory,
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

  test('[POST] /orders [201]', async () => {
    const response1 = await request(app.getHttpServer())
      .post('/orders')
      .set({
        'x-api-key': apiKey.key,
        'x-collaborator-access-token': collaboratorAccessToken,
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response1.statusCode).toEqual(statusCode.Created)
    expect(response1.headers['x-location']).toBeTruthy()

    const orderOnDatabase = await prisma.order.findFirst({
      where: {
        companyId: company.id.toString(),
        marketId: market.id.toString(),
        openedByCollaboratorId: owner.id.toString(),
      },
    })

    expect(orderOnDatabase).toBeTruthy()
  })
})
