import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { Collaborator } from '../entities/Collaborator'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { DatabaseModule } from '@infra/database/database.module'
import request from 'supertest'
import { EnvModule } from '@infra/env/env.module'
import { MakeOwner } from '@test/factories/modules/owner/makeOwner'

describe('Login collaborator (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeOwner: MakeOwner
  let hasherGenerator: HashGenerator
  let collaborator: Collaborator

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

    collaborator = await makeOwner.create({
      name: 'owner',
      login: 'owner',
      password: hashedPassword,
    })

    await app.init()
  })

  test('[POST] /collaborators/login [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/collaborators/login')
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
        collaboratorId: collaborator.id.toString(),
      },
    })

    expect(refreshTokenOnDatabase).toBeTruthy()
  })

  test('[POST] /collaborators/login [403]', async () => {
    // Existent collaborator
    const response = await request(app.getHttpServer())
      .post('/collaborators/login')
      .send({
        login: 'owner',
        password: 'wrong-password',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Forbidden)

    // Inexistent collaborator
    const response2 = await request(app.getHttpServer())
      .post('/collaborators/login')
      .send({
        login: 'inexistent-collaborator',
        password: '12345678',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response2.statusCode).toEqual(statusCode.Forbidden)
  })
})
