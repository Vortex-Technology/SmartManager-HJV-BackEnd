import { AppModule } from '@infra/App.module'
import { PrismaService } from '@infra/database/prisma/index.service'
import { ApiKey } from '@modules/company/entities/ApiKey'
import { Company } from '@modules/company/entities/Company'
import { Inventory } from '@modules/inventory/entities/Inventory'
import { Market } from '@modules/market/entities/Market'
import { Owner } from '@modules/owner/entities/Owner'
import { ProductVariant } from '@modules/product/entities/ProductVariant'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { HandleHashGenerator } from '@providers/cryptography/contracts/handleHashGenerator'
import { makeProductVariant } from '@test/factories/modules/product/makeProductVariant'
import { ProductVariantsList } from '@modules/product/entities/ProductVariantsList'
import { MakeProductVariantInventory } from '@test/factories/modules/inventory/makeProductVariantInventory'
import { ProductVariantInventory } from '@modules/inventory/entities/ProductVariantInventory'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { makeInventory } from '@test/factories/modules/inventory/makeInventory'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { MakeCompany } from '@test/factories/modules/company/makeCompany'
import { MakeProduct } from '@test/factories/modules/product/makeProduct'
import { MakeApiKey } from '@test/factories/modules/company/makeApiKey'
import { MakeMarket } from '@test/factories/modules/market/makeMarket'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'
import { MakeOrder } from '@test/factories/modules/order/makeOrder'
import { MakeUser } from '@test/factories/modules/user/makeUser'
import { DatabaseModule } from '@infra/database/Database.module'
import { User } from '@modules/user/entities/User'
import { INestApplication } from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { Order } from '../entities/Order'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { OrderProductsVariantsList } from '../entities/OrderProductsVariantsList'
import {
  MakeOrderProductVariant,
  makeOrderProductVariant,
} from '@test/factories/modules/order/makeOrderProductVariant'

describe('Close Order (E2E)', async () => {
  let app: INestApplication
  let prisma: PrismaService

  let makeCompany: MakeCompany
  let makeApiKey: MakeApiKey
  let makeUser: MakeUser
  let makeMarket: MakeMarket
  let makeProduct: MakeProduct
  let makeOrder: MakeOrder
  let makeProductVariantInventory: MakeProductVariantInventory
  let makeOrderProductVariant: MakeOrderProductVariant

  let encrypter: Encrypter
  let handleHashGenerator: HandleHashGenerator
  let hashGenerator: HashGenerator

  let user: User
  let owner: Owner
  let company: Company
  let market: Market
  let apiKey: ApiKey
  let inventory: Inventory
  let productVariant: ProductVariant
  let order: Order
  let productVariantInventory: ProductVariantInventory

  let collaboratorAccessToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [
        MakeCompany,
        MakeApiKey,
        MakeUser,
        MakeMarket,
        MakeProduct,
        MakeOrder,
        MakeProductVariantInventory,
        MakeOrderProductVariant,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    makeCompany = moduleRef.get(MakeCompany)
    makeApiKey = moduleRef.get(MakeApiKey)
    makeUser = moduleRef.get(MakeUser)
    makeMarket = moduleRef.get(MakeMarket)
    makeProduct = moduleRef.get(MakeProduct)
    makeOrder = moduleRef.get(MakeOrder)
    makeProductVariantInventory = moduleRef.get(MakeProductVariantInventory)
    makeOrderProductVariant = moduleRef.get(MakeOrderProductVariant)

    encrypter = moduleRef.get(Encrypter)
    hashGenerator = moduleRef.get(HashGenerator)
    handleHashGenerator = moduleRef.get(HandleHashGenerator)

    user = await makeUser.create()

    const companyId = new UniqueEntityId()

    owner = makeOwner({ userId: user.id, companyId })

    company = await makeCompany.create(
      {
        founderId: user.id,
        ownerId: owner.id,
        owner,
      },
      companyId,
    )

    inventory = makeInventory({
      companyId,
    })

    market = await makeMarket.create({
      companyId,
      inventory,
    })

    const secret = await handleHashGenerator.handleHash()
    const key = await hashGenerator.hash(company.companyName + secret)

    apiKey = await makeApiKey.create({
      companyId,
      key,
      secret,
    })

    collaboratorAccessToken = await encrypter.encrypt(
      {
        sub: owner.id.toString(),
        companyId: companyId.toString(),
        marketId: market.id.toString(),
        role: owner.role,
      },
      {
        algorithm: 'HS256',
        secret: apiKey.secret,
      },
    )

    const productId = new UniqueEntityId()

    const productVariants = new ProductVariantsList()

    productVariant = makeProductVariant({
      barCode: '123456',
      productId,
    })

    productVariants.add(productVariant)

    await makeProduct.create(
      {
        productVariants,
      },
      productId,
    )

    productVariantInventory = await makeProductVariantInventory.create({
      inventoryId: inventory.id,
      productVariantId: productVariant.id,
      quantity: 10,
    })

    order = await makeOrder.create({
      companyId: company.id,
      marketId: market.id,
      openedById: owner.id,
    })

    makeOrderProductVariant.create({
      orderId: order.id,
      productVariantId: productVariant.id,
      quantity: 1,
    })

    await app.init()
  })

  test('[POST] /orders/:orderId/close [201]', async () => {
    const response1 = await request(app.getHttpServer())
      .post(`/orders/${order.id.toString()}/close`)
      .set({
        'x-api-key': apiKey.key,
        'x-collaborator-access-token': collaboratorAccessToken,
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response1.statusCode).toEqual(statusCode.Created)
    expect(response1.headers['x-location']).toBeTruthy()

    const orderOnDatabase = await prisma.order.findFirst({
      where: {
        id: order.id.toString(),
      },
    })

    console.log(orderOnDatabase)

    expect(orderOnDatabase?.reportUrl).toBeTruthy()
    expect(orderOnDatabase?.closedAt).toBeTruthy()
    expect(orderOnDatabase?.closedByCollaboratorId).toEqual(owner.id.toString())
  })
})
