import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { MakeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { Administrator, AdministratorRole } from '../entities/Administrator'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { DatabaseModule } from '@infra/database/database.module'
import request from 'supertest'
import { EnvModule } from '@infra/env/env.module'

describe('Create administrator (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeAdministrator: MakeAdministrator
  let hasherGenerator: HashGenerator
  let administrator: Administrator

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule, EnvModule],
      providers: [MakeAdministrator],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeAdministrator = moduleRef.get(MakeAdministrator)
    hasherGenerator = moduleRef.get(HashGenerator)

    const hashedPassword = await hasherGenerator.hash('12345678')

    administrator = await makeAdministrator.create({
      name: 'master',
      login: 'master',
      role: AdministratorRole.MASTER,
      password: hashedPassword,
    })
    await app.init()
  })

  test('[POST] /administrator/login [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/administrator/login')
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
        administratorId: administrator.id.toString(),
      },
    })

    expect(refreshTokenOnDatabase).toBeTruthy()
  })

  test('[POST] /administrator [403]', async () => {
    // Existent administrator
    const response = await request(app.getHttpServer())
      .post('/administrator/login')
      .send({
        login: 'master',
        password: 'wrong-password',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Forbidden)

    // Inexistent administrator
    const response2 = await request(app.getHttpServer())
      .post('/administrator/login')
      .send({
        login: 'inexistent-administrator',
        password: '12345678',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response2.statusCode).toEqual(statusCode.Forbidden)
  })
})
