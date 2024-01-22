import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { MakeUser } from '@test/factories/modules/user/makeUser'
import { User } from '../entities/User'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import request from 'supertest'
import { AppModule } from '@infra/App.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DatabaseModule } from '@infra/database/Database.module'

describe('Get user (E2E)', () => {
  let app: INestApplication
  let makeUser: MakeUser
  let hasherGenerator: HashGenerator
  let encrypter: Encrypter
  let user: User
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeUser],
    }).compile()

    app = moduleRef.createNestApplication()
    makeUser = moduleRef.get(MakeUser)
    hasherGenerator = moduleRef.get(HashGenerator)
    encrypter = moduleRef.get(Encrypter)

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

  test('[GET] /users [200]', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Ok)
    expect(response.body).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          name: 'jonas',
          email: 'jonas@jonas.com',
        }),
      }),
    )
  })

  test('[GET] /users [409]', async () => {
    const invalidToken = await encrypter.encrypt({
      // A random inexistent uuid
      sub: new UniqueEntityId().toString(),
    })

    const response = await request(app.getHttpServer())
      .get('/users')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Conflict)
  })
})
