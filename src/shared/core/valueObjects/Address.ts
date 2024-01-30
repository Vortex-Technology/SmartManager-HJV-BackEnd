import { z } from 'zod'
import { ValueObject } from '../entities/ValueObject'
import { Optional } from '../types/Optional'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

const addressPropsSchema = z.object({
  street: z.string().min(3).max(60),
  number: z.string().min(1).max(5),
  neighborhood: z.string().min(3).max(60),
  city: z.string().min(3).max(60),
  state: z.string().min(2).max(24),
  postalCode: z.string().min(0).max(9),
  country: z.string().min(2).max(60),
  complement: z.string().max(60).nullable(),
})

const addressValidationPipe = new ZodEntityValidationPipe(addressPropsSchema)

export type AddressProps = z.infer<typeof addressPropsSchema>

export class Address extends ValueObject<AddressProps> {
  static create(props: Optional<AddressProps, 'country' | 'complement'>) {
    const addressProps: AddressProps = {
      ...props,
      country: props.country ?? 'BR',
      complement: props.complement ?? null,
    }

    const address = new Address(addressProps)
    address.validate(addressValidationPipe)

    return address
  }

  get street() {
    return this.props.street
  }

  get number() {
    return this.props.number
  }

  get neighborhood() {
    return this.props.neighborhood
  }

  get city() {
    return this.props.city
  }

  get state() {
    return this.props.state
  }

  get postalCode() {
    return this.props.postalCode
  }

  get country() {
    return this.props.country
  }

  get complement() {
    return this.props.complement
  }
}
