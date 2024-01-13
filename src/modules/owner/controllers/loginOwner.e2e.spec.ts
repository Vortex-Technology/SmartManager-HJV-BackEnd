import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { MakeOwner } from '@test/factories/modules/owner/makeOwner'
import { Owner } from '../entities/Owner'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { DatabaseModule } from '@infra/database/database.module'
import request from 'supertest'
import { EnvModule } from '@infra/env/env.module'

describe('Login owner (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeOwner: MakeOwner
  let hasherGenerator: HashGenerator
  let owner: Owner

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule, EnvModule],
      providers: [MakeOwner],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeOwner = moduleRef.get(MakeOwner)
    hasherGenerator = moduleRef.get(HashGenerator)

    const hashedPassword = await hasherGenerator.hash('12345678')

    owner = await makeOwner.create({
      name: 'owner',
      login: 'owner',
      password: hashedPassword,
    })

    await app.init()
  })

  test('[POST] /owners/login [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/owners/login')
      .send({
        login: 'owner',
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
        collaboratorId: owner.id.toString(),
      },
    })

    expect(refreshTokenOnDatabase).toBeTruthy()
  })

  test('[POST] /owners/login [403]', async () => {
    // Existent owner
    const response = await request(app.getHttpServer())
      .post('/owners/login')
      .send({
        login: 'owner',
        password: 'wrong-password',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Forbidden)

    // Inexistent owner
    const response2 = await request(app.getHttpServer())
      .post('/owners/login')
      .send({
        login: 'inexistent-owner',
        password: '12345678',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response2.statusCode).toEqual(statusCode.Forbidden)
  })
})
