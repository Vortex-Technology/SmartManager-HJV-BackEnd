import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { User } from '../entities/User'
import request from 'supertest'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { MakeUser } from '@test/factories/modules/user/makeUser'
import { AppModule } from '@infra/App.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { EnvModule } from '@infra/env/Env.module'

describe('Login user (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeUser: MakeUser
  let hasherGenerator: HashGenerator
  let user: User

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule, EnvModule],
      providers: [MakeUser],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeUser = moduleRef.get(MakeUser)
    hasherGenerator = moduleRef.get(HashGenerator)

    const hashedPassword = await hasherGenerator.hash('12345678')

    user = await makeUser.create({
      name: 'owner',
      email: 'jonas@jonas.com',
      password: hashedPassword,
    })

    await app.init()
  })

  test('[POST] /users/login [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
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

    const refreshTokenOnDatabase = await prisma.refreshToken.findFirst({
      where: {
        userId: user.id.toString(),
      },
    })

    expect(refreshTokenOnDatabase).toBeTruthy()
  })

  test('[POST] /users/login [403]', async () => {
    // Existent user
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: 'jonas@jonas.com',
        password: 'wrong-password',
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Forbidden)

    // Inexistent user
    const response2 = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: 'inexistent@user.com',
        password: '12345678',
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response2.statusCode).toEqual(statusCode.Forbidden)
  })
})
