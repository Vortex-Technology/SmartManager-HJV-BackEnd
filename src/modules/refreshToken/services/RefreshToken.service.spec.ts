// import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
// import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
// import { FakeEncrypter } from '@test/repositories/providers/cryptography/fakeEncrypter'
// import { FakeEnv } from '@test/config/env/fakeEnv'
// import { DayJs } from '@providers/date/implementations/dayJs'
// import { EnvService } from '@infra/env/env.service'
// import { RefreshTokenService } from './refreshToken.service'
// import { AttendantInMemoryRepository } from '@test/repositories/modules/attendant/AttendantInMemoryRepository'
// import { SellerInMemoryRepository } from '@test/repositories/modules/seller/SellerInMemoryRepository'
// import { makeRefreshToken } from '@test/factories/modules/refreshToken/makeRefreshToken'
// import { makeAttendant } from '@test/factories/modules/attendant/makeAttendant'
// import dayjs from 'dayjs'
// import { makeSeller } from '@test/factories/modules/seller/makeSeller'
// import { fakerPT_BR } from '@faker-js/faker'
// import { SessionExpired } from '../errors/SessionExpired'
// import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
// import { CollaboratorNotFound } from '../errors/CollaboratorNotFound'

// let fakeEncrypter: FakeEncrypter
// let fakeEnv: FakeEnv
// let fakeDateProvider: DayJs
// let refreshTokensInMemoryRepository: RefreshTokensInMemoryRepository
// let administratorInMemoryRepository: AdministratorInMemoryRepository
// let attendantInMemoryRepository: AttendantInMemoryRepository
// let sellerInMemoryRepository: SellerInMemoryRepository

// let sut: RefreshTokenService

// describe('Refresh Token', () => {
//   beforeEach(() => {
//     fakeEncrypter = new FakeEncrypter()
//     fakeEnv = new FakeEnv()
//     fakeDateProvider = new DayJs()
//     refreshTokenInMemoryRepository = new RefreshTokenInMemoryRepository()
//     administratorInMemoryRepository = new AdministratorInMemoryRepository()
//     attendantInMemoryRepository = new AttendantInMemoryRepository()
//     sellerInMemoryRepository = new SellerInMemoryRepository()

//     sut = new RefreshTokenService(
//       administratorInMemoryRepository,
//       refreshTokenInMemoryRepository,
//       attendantInMemoryRepository,
//       fakeDateProvider,
//       sellerInMemoryRepository,
//       fakeDateProvider,
//       fakeEncrypter,
//       fakeEncrypter,
//       fakeEnv as EnvService,
//     )
//   })

//   it('should be able to refresh a token of administrator', async () => {
//     const administrator = makeAdministrator()

//     const token = await fakeEncrypter.encrypt({
//       sub: administrator.id.toString(),
//       type: 'ADMINISTRATOR',
//     })

//     const refreshToken = makeRefreshToken({
//       collaboratorId: administrator.id,
//       token,
//       expiresIn: fakeDateProvider.addDaysInCurrentDate(1),
//     })

//     await administratorInMemoryRepository.create(administrator)
//     await refreshTokenInMemoryRepository.create(refreshToken)

//     const response = await sut.execute({
//       refreshToken: token,
//     })

//     expect(response.isRight()).toBe(true)

//     if (response.isRight()) {
//       expect(response.value).toEqual(
//         expect.objectContaining({
//           accessToken: expect.any(String),
//           refreshToken: expect.any(String),
//         }),
//       )
//       expect(refreshTokenInMemoryRepository.refreshTokens).toHaveLength(1)

//       const tokenDecoded = await fakeEncrypter.decrypt(
//         response.value.refreshToken,
//       )

//       expect(tokenDecoded).toBeTruthy()
//       expect(tokenDecoded.payload?.type).toEqual('ADMINISTRATOR')

//       const refreshToken = refreshTokenInMemoryRepository.refreshTokens[0]

//       const receivedDate = dayjs(refreshToken.expiresIn)
//       const expectedDate = fakeDateProvider.addDaysInCurrentDate(
//         fakeEnv.get('ADM_REFRESH_EXPIRES_IN'),
//       )

//       expect(receivedDate.isSame(expectedDate, 'seconds')).toEqual(true)
//     }
//   })

//   it('should be able to refresh a token of attendant', async () => {
//     const attendant = makeAttendant()

//     const token = await fakeEncrypter.encrypt({
//       sub: attendant.id.toString(),
//       type: 'ATTENDANT',
//     })

//     const refreshToken = makeRefreshToken({
//       collaboratorId: attendant.id,
//       token,
//       expiresIn: fakeDateProvider.addDaysInCurrentDate(1),
//     })

//     await attendantInMemoryRepository.create(attendant)
//     await refreshTokenInMemoryRepository.create(refreshToken)

//     const response = await sut.execute({
//       refreshToken: token,
//     })

//     expect(response.isRight()).toBe(true)

//     if (response.isRight()) {
//       expect(response.value).toEqual(
//         expect.objectContaining({
//           accessToken: expect.any(String),
//           refreshToken: expect.any(String),
//         }),
//       )
//       expect(refreshTokenInMemoryRepository.refreshTokens).toHaveLength(1)

//       const tokenDecoded = await fakeEncrypter.decrypt(
//         response.value.refreshToken,
//       )

//       expect(tokenDecoded).toBeTruthy()
//       expect(tokenDecoded.payload?.type).toEqual('ATTENDANT')

//       const refreshToken = refreshTokenInMemoryRepository.refreshTokens[0]

//       const receivedDate = dayjs(refreshToken.expiresIn)
//       const expectedDate = fakeDateProvider.addDaysInCurrentDate(
//         fakeEnv.get('USER_REFRESH_EXPIRES_IN'),
//       )

//       expect(receivedDate.isSame(expectedDate, 'seconds')).toEqual(true)
//     }
//   })

//   it('should be able to refresh a token of seller', async () => {
//     const seller = makeSeller()

//     const token = await fakeEncrypter.encrypt({
//       sub: seller.id.toString(),
//       type: 'SELLER',
//     })

//     const refreshToken = makeRefreshToken({
//       collaboratorId: seller.id,
//       token,
//       expiresIn: fakeDateProvider.addDaysInCurrentDate(1),
//     })

//     await sellerInMemoryRepository.create(seller)
//     await refreshTokenInMemoryRepository.create(refreshToken)

//     const response = await sut.execute({
//       refreshToken: token,
//     })

//     expect(response.isRight()).toBe(true)

//     if (response.isRight()) {
//       expect(response.value).toEqual(
//         expect.objectContaining({
//           accessToken: expect.any(String),
//           refreshToken: expect.any(String),
//         }),
//       )
//       expect(refreshTokenInMemoryRepository.refreshTokens).toHaveLength(1)

//       const tokenDecoded = await fakeEncrypter.decrypt(
//         response.value.refreshToken,
//       )

//       expect(tokenDecoded).toBeTruthy()
//       expect(tokenDecoded.payload?.type).toEqual('SELLER')

//       const refreshToken = refreshTokenInMemoryRepository.refreshTokens[0]

//       const receivedDate = dayjs(refreshToken.expiresIn)
//       const expectedDate = fakeDateProvider.addDaysInCurrentDate(
//         fakeEnv.get('USER_REFRESH_EXPIRES_IN'),
//       )

//       expect(receivedDate.isSame(expectedDate, 'seconds')).toEqual(true)
//     }
//   })

//   it('not should be able to refresh a token if token already expired', async () => {
//     const administrator = makeAdministrator()
//     const token = await fakeEncrypter.encrypt({
//       sub: administrator.id.toString(),
//       type: 'ADMINISTRATOR',
//     })

//     const refreshToken = makeRefreshToken({
//       collaboratorId: administrator.id,
//       token,
//       expiresIn: fakerPT_BR.date.past(),
//     })

//     await administratorInMemoryRepository.create(administrator)
//     await refreshTokenInMemoryRepository.create(refreshToken)

//     const response = await sut.execute({
//       refreshToken: token,
//     })

//     expect(response.isLeft()).toBe(true)
//     expect(response.value).toBeInstanceOf(SessionExpired)
//     expect(refreshTokenInMemoryRepository.refreshTokens).toHaveLength(0)
//   })

//   it('not should be able to refresh a token if collaborator not exists', async () => {
//     const token = await fakeEncrypter.encrypt({
//       sub: 'inexistent-id',
//       type: 'ADMINISTRATOR',
//     })

//     const refreshToken = makeRefreshToken({
//       collaboratorId: new UniqueEntityId('inexistent-id'),
//       token,
//       expiresIn: fakerPT_BR.date.past(),
//     })

//     await refreshTokenInMemoryRepository.create(refreshToken)

//     const response = await sut.execute({
//       refreshToken: token,
//     })

//     expect(response.isLeft()).toBe(true)
//     expect(response.value).toBeInstanceOf(CollaboratorNotFound)
//     expect(refreshTokenInMemoryRepository.refreshTokens).toHaveLength(1)
//   })

//   it('not should be able to refresh a token if token have inexistent type', async () => {
//     const administrator = makeAdministrator()
//     const token = await fakeEncrypter.encrypt({
//       sub: administrator.id.toString(),
//       type: 'ADM',
//     })

//     const refreshToken = makeRefreshToken({
//       collaboratorId: administrator.id,
//       token,
//       expiresIn: fakerPT_BR.date.past(),
//     })

//     await administratorInMemoryRepository.create(administrator)
//     await refreshTokenInMemoryRepository.create(refreshToken)

//     const response = await sut.execute({
//       refreshToken: token,
//     })

//     expect(response.isLeft()).toBe(true)
//     expect(response.value).toBeInstanceOf(CollaboratorNotFound)
//     expect(refreshTokenInMemoryRepository.refreshTokens).toHaveLength(1)
//   })

//   it('not should be able to refresh a token if token not exist', async () => {
//     const administrator = makeAdministrator()
//     const token = await fakeEncrypter.encrypt({
//       sub: administrator.id.toString(),
//       type: 'ADMINISTRATOR',
//     })

//     await administratorInMemoryRepository.create(administrator)

//     const response = await sut.execute({
//       refreshToken: token,
//     })

//     expect(response.isLeft()).toBe(true)
//     expect(response.value).toBeInstanceOf(SessionExpired)
//     expect(refreshTokenInMemoryRepository.refreshTokens).toHaveLength(0)
//   })

//   it('should be able to delete permanently all tokens of administrator when a new is created', async () => {
//     const administrator = makeAdministrator()
//     const token = await fakeEncrypter.encrypt({
//       sub: administrator.id.toString(),
//       type: 'ADMINISTRATOR',
//     })

//     for (let i = 0; i <= 10; i++) {
//       const refreshToken = makeRefreshToken({
//         collaboratorId: administrator.id,
//         token,
//         expiresIn: fakeDateProvider.addDaysInCurrentDate(1),
//       })

//       await refreshTokenInMemoryRepository.create(refreshToken)
//     }

//     await administratorInMemoryRepository.create(administrator)

//     const response = await sut.execute({
//       refreshToken: token,
//     })

//     expect(response.isRight()).toBe(true)

//     if (response.isRight()) {
//       expect(response.value).toEqual(
//         expect.objectContaining({
//           accessToken: expect.any(String),
//           refreshToken: expect.any(String),
//         }),
//       )
//       expect(refreshTokenInMemoryRepository.refreshTokens).toHaveLength(1)

//       const tokenDecoded = await fakeEncrypter.decrypt(
//         response.value.refreshToken,
//       )

//       expect(tokenDecoded).toBeTruthy()
//       expect(tokenDecoded.payload?.type).toEqual('ADMINISTRATOR')

//       const refreshToken = refreshTokenInMemoryRepository.refreshTokens[0]

//       const receivedDate = dayjs(refreshToken.expiresIn)
//       const expectedDate = fakeDateProvider.addDaysInCurrentDate(
//         fakeEnv.get('ADM_REFRESH_EXPIRES_IN'),
//       )

//       expect(receivedDate.isSame(expectedDate, 'seconds')).toEqual(true)
//     }
//   })
// })
