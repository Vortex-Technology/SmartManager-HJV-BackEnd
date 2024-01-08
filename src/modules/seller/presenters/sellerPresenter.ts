import { Seller } from '../entities/Seller'

export class SellerPresenter {
  static toHTTP(seller: Seller) {
    return {
      id: seller.id.toString(),
      name: seller.name,
      image: {
        url: seller.image,
        alt: seller.name,
      },
    }
  }
}
