import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { MakeAttendant } from '@test/factories/modules/attendant/makeAttendant'
import { Attendant } from '../entities/Attendant'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DatabaseModule } from '@infra/database/database.module'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import request from 'supertest'

describe('Get attendant (E2E)', () => {
  let app: INestApplication
  let makeAttendant: MakeAttendant
  let hasherGenerator: HashGenerator
  let encrypter: Encrypter
  let master: Attendant
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeAttendant],
    }).compile()

    app = moduleRef.createNestApplication()
    makeAttendant = moduleRef.get(MakeAttendant)
    hasherGenerator = moduleRef.get(HashGenerator)
    encrypter = moduleRef.get(Encrypter)

    const hashedPassword = await hasherGenerator.hash('12345678')

    master = await makeAttendant.create({
      name: 'master',
      login: 'master',
      password: hashedPassword,
    })

    token = await encrypter.encrypt({
      sub: master.id.toString(),
      type: 'ATTENDANT',
    })

    await app.init()
  })

  test('[GET] /attendant [200]', async () => {
    const response = await request(app.getHttpServer())
      .get('/attendant')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Ok)
    expect(response.body).toEqual(
      expect.objectContaining({
        attendant: expect.objectContaining({
          name: 'master',
        }),
      }),
    )
  })

  test('[GET] /attendant [409]', async () => {
    const invalidToken = await encrypter.encrypt({
      // A random inexistent uuid
      sub: new UniqueEntityId().toString(),
      type: 'ATTENDANT',
    })

    const response = await request(app.getHttpServer())
      .get('/attendant')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Conflict)
  })
})
