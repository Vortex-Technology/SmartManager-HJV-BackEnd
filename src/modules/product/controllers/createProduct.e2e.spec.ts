import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DatabaseModule } from '@infra/database/database.module'
import { MakeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import request from 'supertest'
import {
  Administrator,
  AdministratorRole,
} from '@modules/administrator/entities/Administrator'
import { MakeProductCategory } from '@test/factories/modules/product/makeProductCategory'
import { ProductCategory } from '../entities/ProductCategory'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

describe('Create product (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeAdministrator: MakeAdministrator
  let makeProductCategory: MakeProductCategory
  let encrypter: Encrypter
  let master: Administrator
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeAdministrator, MakeProductCategory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeAdministrator = moduleRef.get(MakeAdministrator)
    makeProductCategory = moduleRef.get(MakeProductCategory)
    encrypter = moduleRef.get(Encrypter)

    master = await makeAdministrator.create({
      role: AdministratorRole.FULL_ACCESS,
    })

    await makeProductCategory.create({
      name: ProductCategory.normalizeName('product category'),
    })

    token = await encrypter.encrypt({
      sub: master.id.toString(),
      role: master.role,
      type: 'ADMINISTRATOR',
    })

    await app.init()
  })

  test('[POST] /products [201]', async () => {
    const response1 = await request(app.getHttpServer())
      .post('/products')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        name: 'product',
        categories: ['product category', 'product category2'],
        variants: [
          {
            name: 'variant',
            pricePerUnit: 1000,
            unitType: 'UN',
            brand: 'vanilla',
            barCode: '123456',
          },
        ],
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response1.statusCode).toEqual(statusCode.Created)
    expect(response1.headers.location).toBeTruthy()
    expect(response1.body.errors).not.toBeTruthy()

    const productOnDatabase = await prisma.product.findFirst({
      where: {
        name: 'product',
      },
      include: {
        _count: {
          select: {
            productVariants: true,
          },
        },
      },
    })

    expect(productOnDatabase).toBeTruthy()
    expect(productOnDatabase?._count.productVariants).toEqual(1)

    const response2 = await request(app.getHttpServer())
      .post('/products')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        name: 'product-2',
        categories: ['product category', 'product category2'],
        variants: [
          {
            name: 'variant',
            pricePerUnit: 1000,
            unitType: 'UN',
            brand: 'vanilla',
            barCode: '123456',
          },
          {
            name: 'variant',
            pricePerUnit: 1000,
            unitType: 'UN',
            brand: 'vanilla',
            barCode: '12345678',
          },
        ],
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response2.statusCode).toEqual(statusCode.Created)
    expect(response2.headers.location).toBeTruthy()
    expect(response2.body.errors).toBeTruthy()
    expect(response2.body.errors).toHaveLength(1)

    const productOnDatabase2 = await prisma.product.findFirst({
      where: {
        name: 'product-2',
      },
      include: {
        _count: {
          select: {
            productVariants: true,
          },
        },
      },
    })
    const numberOfCategoriesOnDatabase = await prisma.productCategory.count()

    expect(productOnDatabase2).toBeTruthy()
    expect(productOnDatabase2?._count.productVariants).toEqual(1)
    expect(numberOfCategoriesOnDatabase).toEqual(2)
  })

  test('[POST] /products [409]', async () => {
    const response = await request(app.getHttpServer())
      .post('/products')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        name: 'product',
        categories: ['product category', 'product category2'],
        variants: [
          {
            name: 'variant',
            pricePerUnit: 1000,
            unitType: 'UN',
            brand: 'vanilla',
            barCode: '123456',
          },
        ],
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
      .post('/products')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .send({
        name: 'product',
        categories: ['product category', 'product category2'],
        variants: [
          {
            name: 'variant',
            pricePerUnit: 1000,
            unitType: 'UN',
            brand: 'vanilla',
            barCode: '123456',
          },
        ],
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response2.statusCode).toEqual(statusCode.Conflict)
  })

  test('[POST] /products [403]', async () => {
    const invalidToken = await encrypter.encrypt({
      sub: master.id.toString(),
      role: AdministratorRole.VIEWER,
      type: 'ADMINISTRATOR',
    })

    const response = await request(app.getHttpServer())
      .post('/products')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .send({
        name: 'product',
        categories: ['product category', 'product category2'],
        variants: [
          {
            name: 'variant',
            pricePerUnit: 1000,
            unitType: 'UN',
            brand: 'vanilla',
            barCode: '123456',
          },
        ],
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Forbidden)
  })
})
