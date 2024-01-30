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

describe('Create market (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeCompany: MakeCompany
  let makeApiKey: MakeApiKey
  let makeUser: MakeUser
  let user: User
  let owner: Owner
  let company: Company
  let apiKey: ApiKey
  let encrypter: Encrypter
  let collaboratorAccessToken: string
  let hashGenerator: HashGenerator
  let handleHashGenerator: HandleHashGenerator

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeCompany, MakeApiKey, MakeUser],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeCompany = moduleRef.get(MakeCompany)
    makeApiKey = moduleRef.get(MakeApiKey)
    makeUser = moduleRef.get(MakeUser)

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
        role: owner.role,
      },
      {
        algorithm: 'HS256',
        secret: apiKey.secret,
      },
    )

    await app.init()
  })

  test('[POST] /markets [201]', async () => {
    const response = await request(app.getHttpServer())
      .post(`/markets`)
      .set({
        'x-api-key': apiKey.key,
        'x-collaborator-access-token': collaboratorAccessToken,
      })
      .send({
        tradeName: 'Vortex',
        street: 'Av. das Nações Unidas',
        number: '1200',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01234000',
        country: 'BR',
        complement: 'apto 123',
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Created)
    expect(response.headers).toEqual(
      expect.objectContaining({
        'x-location': expect.any(String),
      }),
    )

    const marketOnDatabase = await prisma.market.findFirst({
      where: {
        tradeName: 'Vortex',
      },
    })

    expect(marketOnDatabase).toBeTruthy()
  })
})
