import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { MakeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { Administrator, AdministratorRole } from '../entities/Administrator'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DatabaseModule } from '@infra/database/database.module'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import request from 'supertest'

describe('Get administrator (E2E)', () => {
  let app: INestApplication
  let makeAdministrator: MakeAdministrator
  let hasherGenerator: HashGenerator
  let encrypter: Encrypter
  let master: Administrator
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeAdministrator],
    }).compile()

    app = moduleRef.createNestApplication()
    makeAdministrator = moduleRef.get(MakeAdministrator)
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
    })

    await app.init()
  })

  test('[GET] /administrator [200]', async () => {
    const response = await request(app.getHttpServer())
      .get('/administrator')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Ok)
    expect(response.body).toEqual(
      expect.objectContaining({
        administrator: expect.objectContaining({
          name: 'master',
        }),
      }),
    )
  })

  test('[GET] /administrator [409]', async () => {
    const invalidToken = await encrypter.encrypt({
      // A random inexistent uuid
      sub: new UniqueEntityId().toString(),
      role: master.role,
    })

    const response = await request(app.getHttpServer())
      .get('/administrator')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Conflict)
  })
})
