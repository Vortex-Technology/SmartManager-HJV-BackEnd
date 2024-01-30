import { BadRequestException } from '@nestjs/common'
import { createProductCategoryBodyValidationPipe } from './CreateProductCategory.gateway'

describe('Create product category gateway', () => {
  it('should be able to validate body create product category', () => {
    const body = {
      name: 'name-category',
      description: 'description-category',
    }

    const result = createProductCategoryBodyValidationPipe.transform(body)

    expect(result).toEqual(body)
    expect(result.name).toEqual('name-category')
  })

  it('not should be able to validate body create product category if belong a name', () => {
    expect(async () => {
      createProductCategoryBodyValidationPipe.transform({
        description: 'description-category',
      })
    }).rejects.toBeInstanceOf(BadRequestException)
  })
})
