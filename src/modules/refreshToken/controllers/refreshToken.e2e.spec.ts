import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { MakeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DatabaseModule } from '@infra/database/database.module'
import request from 'supertest'
import {
  Administrator,
  AdministratorRole,
} from '@modules/administrator/entities/Administrator'
import { MakeRefreshToken } from '@test/factories/modules/refreshToken/makeRefreshToken'

describe('Refresh token (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeAdministrator: MakeAdministrator
  let makeRefreshToken: MakeRefreshToken
  let hasherGenerator: HashGenerator
  let encrypter: Encrypter
  let master: Administrator
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeAdministrator, MakeRefreshToken],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeAdministrator = moduleRef.get(MakeAdministrator)
    makeRefreshToken = moduleRef.get(MakeRefreshToken)
    hasherGenerator = moduleRef.get(HashGenerator)
    encrypter = moduleRef.get(Encrypter)

    const hashedPassword = await hasherGenerator.hash('12345678')

    master = await makeAdministrator.create({
      name: 'master',
      login: 'master',
      role: AdministratorRole.MASTER,
      password: hashedPassword,
    })

    token = await encrypter.encrypt({
      sub: master.id.toString(),
      role: master.role,
      type: 'ADMINISTRATOR',
    })

    await makeRefreshToken.create({
      collaboratorId: master.id,
      token,
    })

    await app.init()
  })

  test('[POST] /refreshToken [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/refreshToken')
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
        collaboratorId: master.id.toString(),
      },
    })

    expect(refreshTokensOnDatabase).toEqual(1)
  })
})
