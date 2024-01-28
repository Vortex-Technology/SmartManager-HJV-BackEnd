import { ValueObject } from '../entities/ValueObject'
import { Optional } from '../types/Optional'

export interface AddressProps {
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  complement: string | null
}

export class Address extends ValueObject<AddressProps> {
  static create(props: Optional<AddressProps, 'country' | 'complement'>) {
    return new Address({
      ...props,
      country: props.country ?? 'BR',
      complement: props.complement ?? null,
    })
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

  get address() {
    return {
      street: this.street,
      number: this.number,
      neighborhood: this.neighborhood,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      complement: this.complement,
    }
  }
}
