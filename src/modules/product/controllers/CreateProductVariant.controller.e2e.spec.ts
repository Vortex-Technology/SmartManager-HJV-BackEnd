import { AppModule } from '@infra/App.module'
import { DatabaseModule } from '@infra/database/Database.module'
import { PrismaService } from '@infra/database/prisma/index.service'
import { ApiKey } from '@modules/company/entities/ApiKey'
import { Company } from '@modules/company/entities/Company'
import { Market } from '@modules/market/entities/Market'
import { Owner } from '@modules/owner/entities/Owner'
import { User } from '@modules/user/entities/User'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { HandleHashGenerator } from '@providers/cryptography/contracts/handleHashGenerator'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { MakeApiKey } from '@test/factories/modules/company/makeApiKey'
import { MakeCompany } from '@test/factories/modules/company/makeCompany'
import { MakeMarket } from '@test/factories/modules/market/makeMarket'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'
import { MakeUser } from '@test/factories/modules/user/makeUser'
import request from 'supertest'
import { Product } from '../entities/Product'
import { MakeProduct } from '@test/factories/modules/product/makeProduct'
import { Inventory } from '@modules/inventory/entities/Inventory'
import { statusCode } from '@config/statusCode'
import { makeInventory } from '@test/factories/modules/inventory/makeInventory'

describe('Create product variant (E2E)', async () => {
  let app: INestApplication
  let prisma: PrismaService

  let makeCompany: MakeCompany
  let makeApiKey: MakeApiKey
  let makeUser: MakeUser
  let makeMarket: MakeMarket
  let makeProduct: MakeProduct

  let encrypter: Encrypter
  let handleHashGenerator: HandleHashGenerator
  let hashGenerator: HashGenerator

  let user: User
  let owner: Owner
  let company: Company
  let market: Market
  let apiKey: ApiKey
  let product: Product
  let inventory: Inventory

  let collaboratorAccessToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeCompany, MakeApiKey, MakeUser, MakeMarket, MakeProduct],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    makeCompany = moduleRef.get(MakeCompany)
    makeApiKey = moduleRef.get(MakeApiKey)
    makeUser = moduleRef.get(MakeUser)
    makeMarket = moduleRef.get(MakeMarket)
    makeProduct = moduleRef.get(MakeProduct)

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

    product = await makeProduct.create()

    await app.init()
  })

  test('[POST] /products/:productId/variants [201]', async () => {
    const response1 = await request(app.getHttpServer())
      .post(`/products/${product.id.toString()}/variants`)
      .set({
        'x-api-key': apiKey.key,
        'x-collaborator-access-token': collaboratorAccessToken,
      })
      .send({
        name: 'variant-16',
        pricePerUnit: 1000,
        unitType: 'UN',
        brand: 'vanilla',
        barCode: '123456',
        quantity: 10,
        inventoryId: inventory.id.toString(),
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response1.statusCode).toEqual(statusCode.Created)
    expect(response1.headers['x-location']).toBeTruthy()

    const productVariantOnDatabase = await prisma.productVariant.findFirst({
      where: {
        name: 'variant-16',
      },
      include: {
        productVariantInventories: true,
      },
    })

    expect(productVariantOnDatabase).toBeTruthy()
    expect(
      productVariantOnDatabase?.productVariantInventories[0].quantity,
    ).toEqual(10)
  })
})
