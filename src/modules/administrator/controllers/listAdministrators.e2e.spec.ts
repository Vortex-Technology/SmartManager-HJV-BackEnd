import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { MakeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { Administrator, AdministratorRole } from '../entities/Administrator'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DatabaseModule } from '@infra/database/database.module'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import request from 'supertest'

describe('List administrator (E2E)', () => {
  let app: INestApplication
  let makeAdministrator: MakeAdministrator
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
    encrypter = moduleRef.get(Encrypter)

    master = await makeAdministrator.create({
      role: AdministratorRole.MASTER,
    })

    token = await encrypter.encrypt({
      sub: master.id.toString(),
      role: master.role,
      type: 'ADMINISTRATOR',
    })

    await app.init()
  })

  test('[GET] /administrators/list [200]', async () => {
    for (let i = 0; i < 20; i++) {
      await makeAdministrator.create({
        login: new UniqueEntityId().toString(),
      })
    }

    const response = await request(app.getHttpServer())
      .get('/administrators/list?page=1&limit=10')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Ok)
    expect(response.body.administrators).toHaveLength(10)
    expect(response.headers['x-total-count']).toBe('21')
    expect(response.headers['x-page']).toBe('1')
  })

  test('[GET] /administrators/list [409]', async () => {
    const invalidToken = await encrypter.encrypt({
      // A random inexistent uuid
      sub: new UniqueEntityId().toString(),
      role: master.role,
      type: 'ADMINISTRATOR',
    })

    const response = await request(app.getHttpServer())
      .get('/administrators/list')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Conflict)
  })
})
