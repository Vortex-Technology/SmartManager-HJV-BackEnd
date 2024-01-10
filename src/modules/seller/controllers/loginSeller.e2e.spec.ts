import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { MakeSeller } from '@test/factories/modules/seller/makeSeller'
import { Seller } from '../entities/Seller'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { DatabaseModule } from '@infra/database/database.module'
import request from 'supertest'
import { EnvModule } from '@infra/env/env.module'

describe('Login seller (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeSeller: MakeSeller
  let hasherGenerator: HashGenerator
  let seller: Seller

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule, EnvModule],
      providers: [MakeSeller],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeSeller = moduleRef.get(MakeSeller)
    hasherGenerator = moduleRef.get(HashGenerator)

    const hashedPassword = await hasherGenerator.hash('12345678')

    seller = await makeSeller.create({
      name: 'master',
      login: 'master',
      password: hashedPassword,
    })
    await app.init()
  })

  test('[POST] /sellers/login [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/sellers/login')
      .send({
        login: 'master',
        password: '12345678',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Created)
    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    )

    const refreshTokenOnDatabase = await prisma.refreshToken.findFirst({
      where: {
        collaboratorId: seller.id.toString(),
      },
    })

    expect(refreshTokenOnDatabase).toBeTruthy()
  })

  test('[POST] /sellers/login [403]', async () => {
    // Existent seller
    const response = await request(app.getHttpServer())
      .post('/sellers/login')
      .send({
        login: 'master',
        password: 'wrong-password',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Forbidden)

    // Inexistent seller
    const response2 = await request(app.getHttpServer())
      .post('/sellers/login')
      .send({
        login: 'inexistent-seller',
        password: '12345678',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response2.statusCode).toEqual(statusCode.Forbidden)
  })
})
