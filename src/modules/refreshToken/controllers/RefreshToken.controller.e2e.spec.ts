import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import request from 'supertest'
import { MakeRefreshToken } from '@test/factories/modules/refreshToken/makeRefreshToken'
import { MakeUser } from '@test/factories/modules/user/makeUser'
import { User } from '@modules/user/entities/User'
import { AppModule } from '@infra/App.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DatabaseModule } from '@infra/database/Database.module'

describe('Refresh token (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeUser: MakeUser
  let makeRefreshToken: MakeRefreshToken
  let hasherGenerator: HashGenerator
  let encrypter: Encrypter
  let user: User
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeUser, MakeRefreshToken],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeUser = moduleRef.get(MakeUser)
    makeRefreshToken = moduleRef.get(MakeRefreshToken)
    hasherGenerator = moduleRef.get(HashGenerator)
    encrypter = moduleRef.get(Encrypter)

    const hashedPassword = await hasherGenerator.hash('12345678')

    user = await makeUser.create({
      name: 'user',
      email: 'jonas@joans.com',
      password: hashedPassword,
    })

    token = await encrypter.encrypt({
      sub: user.id.toString(),
    })

    await makeRefreshToken.create({
      userId: user.id,
      token,
    })

    await app.init()
  })

  test('[POST] /refreshTokens [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/refreshTokens')
      .send({
        refreshToken: token,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Created)
    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    )

    const refreshTokensOnDatabase = await prisma.refreshToken.count({
      where: {
        userId: user.id.toString(),
      },
    })

    expect(refreshTokensOnDatabase).toEqual(1)
  })
})
