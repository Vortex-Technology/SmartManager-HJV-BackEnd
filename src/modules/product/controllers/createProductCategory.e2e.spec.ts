import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DatabaseModule } from '@infra/database/database.module'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { MakeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import request from 'supertest'
import {
  Administrator,
  AdministratorRole,
} from '@modules/administrator/entities/Administrator'

describe('Create product category (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
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
    prisma = moduleRef.get(PrismaService)
    makeAdministrator = moduleRef.get(MakeAdministrator)
    encrypter = moduleRef.get(Encrypter)

    master = await makeAdministrator.create({
      role: AdministratorRole.FULL_ACCESS,
    })

    token = await encrypter.encrypt({
      sub: master.id.toString(),
      role: master.role,
      type: 'ADMINISTRATOR',
    })

    await app.init()
  })

  test('[POST] /products/categories [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/products/categories')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        name: 'product category',
        description: 'A new product category to test the creation',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Created)
    expect(response.headers.location).toBeTruthy()

    const productCategoryOnDatabase = await prisma.productCategory.findUnique({
      where: {
        name: 'product-category',
      },
    })

    expect(productCategoryOnDatabase).toBeTruthy()
  })

  test('[POST] /products/categories [409]', async () => {
    const response = await request(app.getHttpServer())
      .post('/products/categories')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        name: 'product category',
        description: 'A new product category to test the creation',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Conflict)

    const invalidToken = await encrypter.encrypt({
      // A random inexistent uuid
      sub: new UniqueEntityId().toString(),
      role: master.role,
      type: 'ADMINISTRATOR',
    })

    const response2 = await request(app.getHttpServer())
      .post('/products/categories')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .send({
        name: 'product category 2',
        description: 'A new product category to test the creation',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response2.statusCode).toEqual(statusCode.Conflict)

    const productCategoriesOnDatabase = await prisma.productCategory.count()
    expect(productCategoriesOnDatabase).toEqual(1)
  })

  test('[POST] /products/categories [403]', async () => {
    const invalidToken = await encrypter.encrypt({
      sub: master.id.toString(),
      role: AdministratorRole.VIEWER,
      type: 'ADMINISTRATOR',
    })

    const response = await request(app.getHttpServer())
      .post('/products/categories')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .send({
        name: 'product category 3',
        description: 'A new product category to test the creation',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Forbidden)

    const productCategoriesOnDatabase = await prisma.productCategory.count()
    expect(productCategoriesOnDatabase).toEqual(1)
  })
})
