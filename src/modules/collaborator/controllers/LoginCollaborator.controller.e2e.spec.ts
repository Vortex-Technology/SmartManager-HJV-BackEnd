import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import request from 'supertest'
import { AppModule } from '@infra/App.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { EnvModule } from '@infra/env/Env.module'

describe('Login collaborator (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule, EnvModule],
      providers: [],
    }).compile()

    app = moduleRef.createNestApplication()

    await app.init()
  })

  test.skip('[POST] /collaborators/login [201]', async () => {
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
  })

  test.skip('[POST] /collaborators/login [403]', async () => {
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
