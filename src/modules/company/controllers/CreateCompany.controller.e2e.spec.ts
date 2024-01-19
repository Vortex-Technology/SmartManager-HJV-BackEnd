import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { MakeUser } from '@test/factories/modules/user/makeUser'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import request from 'supertest'
import { AppModule } from '@infra/App.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { User } from '@modules/user/entities/User'
import { PrismaService } from '@infra/database/prisma/index.service'

describe('Create company (E2E)', () => {
  let app: INestApplication
  let makeUser: MakeUser
  let hasherGenerator: HashGenerator
  let encrypter: Encrypter
  let user: User
  let token: string
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeUser, DatabaseModule],
    }).compile()

    app = moduleRef.createNestApplication()
    makeUser = moduleRef.get(MakeUser)
    hasherGenerator = moduleRef.get(HashGenerator)
    encrypter = moduleRef.get(Encrypter)
    prisma = moduleRef.get(PrismaService)

    const hashedPassword = await hasherGenerator.hash('12345678')

    user = await makeUser.create({
      name: 'jonas',
      email: 'jonas@jonas.com',
      password: hashedPassword,
    })

    token = await encrypter.encrypt({
      sub: user.id.toString(),
    })

    await app.init()
  })

  test('[GET] /companies [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/companies')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        startedIssueInvoicesNow: false,
        companyName: 'Vortex',
        email: 'jonas@jonas.com',
        sector: 'Tech',
        street: 'Avenida Brigadeiro Faria Lima',
        number: '123',
        neighborhood: 'Vila Madalena',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '12345678',
        markets: [
          {
            tradeName: 'Vortex',
            street: 'Avenida Brigadeiro Faria Lima',
            number: '123',
            neighborhood: 'Vila Madalena',
            city: 'São Paulo',
            state: 'SP',
            postalCode: '12345678',
          },
        ],
      })
      .timeout({ deadline: 10000, response: 10000 })

    const [
      companiesInDatabase,
      collaboratorsInDatabase,
      marketsInDatabase,
      addressesInDatabase,
      inventoriesInDatabase,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.collaborator.count(),
      prisma.market.count(),
      prisma.address.count(),
      prisma.inventory.count(),
    ])

    expect(response.statusCode).toEqual(statusCode.Created)
    expect(companiesInDatabase).toEqual(1)
    expect(collaboratorsInDatabase).toEqual(1)
    expect(marketsInDatabase).toEqual(1)
    expect(addressesInDatabase).toEqual(2)
    expect(inventoriesInDatabase).toEqual(1)
    expect(response.headers).toEqual(
      expect.objectContaining({
        'x-location': expect.any(String),
      }),
    )
  })

  // test('[GET] /users [409]', async () => {
  //   const invalidToken = await encrypter.encrypt({
  //     // A random inexistent uuid
  //     sub: new UniqueEntityId().toString(),
  //   })

  //   const response = await request(app.getHttpServer())
  //     .get('/users')
  //     .set({
  //       Authorization: `Bearer ${invalidToken}`,
  //     })
  //     .timeout({ deadline: 10000, response: 10000 })

  //   expect(response.statusCode).toEqual(statusCode.Conflict)
  // })
})
