import { fakerPT_BR } from '@faker-js/faker'
import { Address, AddressProps } from '@shared/core/valueObjects/Address'

export function makeAddress(override: Partial<AddressProps> = {}) {
  return Address.create({
    city: fakerPT_BR.location.city(),
    complement: fakerPT_BR.location.direction(),
    neighborhood: fakerPT_BR.location.city(),
    number: fakerPT_BR.location.buildingNumber(),
    postalCode: fakerPT_BR.location.zipCode(),
    state: fakerPT_BR.location.state(),
    street: fakerPT_BR.location.street(),
    ...override,
  })
}
