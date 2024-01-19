import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { MakeSeller } from '@test/factories/modules/seller/makeSeller'
import { Seller } from '../entities/Seller'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DatabaseModule } from '@infra/database/database.module'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import request from 'supertest'

describe('Get seller (E2E)', () => {
  let app: INestApplication
  let makeSeller: MakeSeller
  let hasherGenerator: HashGenerator
  let encrypter: Encrypter
  let master: Seller
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeSeller],
    }).compile()

    app = moduleRef.createNestApplication()
    makeSeller = moduleRef.get(MakeSeller)
    hasherGenerator = moduleRef.get(HashGenerator)
    encrypter = moduleRef.get(Encrypter)

    const hashedPassword = await hasherGenerator.hash('12345678')

    master = await makeSeller.create({
      name: 'master',
      login: 'master',
      password: hashedPassword,
    })

    token = await encrypter.encrypt({
      sub: master.id.toString(),
      type: 'SELLER',
    })

    await app.init()
  })

  test('[GET] /sellers [200]', async () => {
    const response = await request(app.getHttpServer())
      .get('/sellers')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Ok)
    expect(response.body).toEqual(
      expect.objectContaining({
        seller: expect.objectContaining({
          name: 'master',
        }),
      }),
    )
  })

  test('[GET] /sellers [409]', async () => {
    const invalidToken = await encrypter.encrypt({
      // A random inexistent uuid
      sub: new UniqueEntityId().toString(),
      type: 'SELLER',
    })

    const response = await request(app.getHttpServer())
      .get('/sellers')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Conflict)
  })
})
