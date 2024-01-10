import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { MakeAttendant } from '@test/factories/modules/attendant/makeAttendant'
import { Attendant } from '../entities/Attendant'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { DatabaseModule } from '@infra/database/database.module'
import request from 'supertest'
import { EnvModule } from '@infra/env/env.module'

describe('Login attendant (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeAttendant: MakeAttendant
  let hasherGenerator: HashGenerator
  let attendant: Attendant

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule, EnvModule],
      providers: [MakeAttendant],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeAttendant = moduleRef.get(MakeAttendant)
    hasherGenerator = moduleRef.get(HashGenerator)

    const hashedPassword = await hasherGenerator.hash('12345678')

    attendant = await makeAttendant.create({
      name: 'master',
      login: 'master',
      password: hashedPassword,
    })
    await app.init()
  })

  test('[POST] /attendants/login [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/attendants/login')
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
        collaboratorId: attendant.id.toString(),
      },
    })

    expect(refreshTokenOnDatabase).toBeTruthy()
  })

  test('[POST] /attendants/login [403]', async () => {
    // Existent attendant
    const response = await request(app.getHttpServer())
      .post('/attendants/login')
      .send({
        login: 'master',
        password: 'wrong-password',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Forbidden)

    // Inexistent attendant
    const response2 = await request(app.getHttpServer())
      .post('/attendants/login')
      .send({
        login: 'inexistent-attendant',
        password: '12345678',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response2.statusCode).toEqual(statusCode.Forbidden)
  })
})
