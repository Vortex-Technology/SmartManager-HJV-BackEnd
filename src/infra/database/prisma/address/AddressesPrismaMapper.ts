import { Prisma, Address as AddressPrisma } from '@prisma/client'
import { Address } from '@shared/core/valueObjects/Address'

export class AddressesPrismaMapper {
  static toEntity(raw: AddressPrisma): Address {
    return Address.create({
      city: raw.city,
      neighborhood: raw.neighborhood,
      number: raw.number,
      postalCode: raw.postalCode,
      state: raw.state,
      street: raw.street,
      complement: raw.complement,
      country: raw.country,
    })
  }

  static toPrisma(address: Address): Prisma.AddressUncheckedCreateInput {
    return {
      postalCode: address.postalCode, pu
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      country: address.country,
    }
  }
}
