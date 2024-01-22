import { Module } from '@nestjs/common'
import { Encrypter } from './contracts/encrypter'
import { JwtEncrypter } from './implementations/jwtEncrypter'
import { HashComparer } from './contracts/hashComparer'
import { BcryptHasher } from './implementations/bcryptHasher'
import { HashGenerator } from './contracts/hashGenerator'
import { Decoder } from './contracts/decoder'
import { HandleHashGenerator } from './contracts/handleHashGenerator'
import { CryptoHasher } from './implementations/cryptoHasher'

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: Decoder, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
    { provide: HandleHashGenerator, useClass: CryptoHasher },
  ],
  exports: [
    Encrypter,
    HashComparer,
    HashGenerator,
    Decoder,
    HandleHashGenerator,
  ],
})
export class CryptographyModule {}
