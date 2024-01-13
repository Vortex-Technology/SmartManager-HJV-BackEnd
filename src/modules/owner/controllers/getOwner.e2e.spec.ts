import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { MakeOwner } from '@test/factories/modules/owner/makeOwner'
import { Owner } from '../entities/Owner'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DatabaseModule } from '@infra/database/database.module'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import request from 'supertest'

describe('Get owner (E2E)', () => {
  let app: INestApplication
  let makeOwner: MakeOwner
  let hasherGenerator: HashGenerator
  let encrypter: Encrypter
  let owner: Owner
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeOwner],
    }).compile()

    app = moduleRef.createNestApplication()
    makeOwner = moduleRef.get(MakeOwner)
    hasherGenerator = moduleRef.get(HashGenerator)
    encrypter = moduleRef.get(Encrypter)

    const hashedPassword = await hasherGenerator.hash('12345678')

    owner = await makeOwner.create({
      name: 'owner',
      login: 'owner',
      password: hashedPassword,
    })

    token = await encrypter.encrypt({
      sub: owner.id.toString(),
      role: owner.role,
    })

    await app.init()
  })

  test('[GET] /owners [200]', async () => {
    const response = await request(app.getHttpServer())
      .get('/owners')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Ok)
    expect(response.body).toEqual(
      expect.objectContaining({
        owner: expect.objectContaining({
          name: 'owner',
        }),
      }),
    )
  })

  test('[GET] /owners [409]', async () => {
    const invalidToken = await encrypter.encrypt({
      // A random inexistent uuid
      sub: new UniqueEntityId().toString(),
      role: owner.role,
    })

    const response = await request(app.getHttpServer())
      .get('/owners')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Conflict)
  })
})
