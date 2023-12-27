import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { DeleteAdministratorService } from './deleteAdministrator.service'
import { AdministratorRole } from '../entities/Administrator'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { AdministratorToExcludeNotFound } from '../errors/AdministratorToExcludeNotFound'

let administratorInMemoryRepository: AdministratorInMemoryRepository

let sut: DeleteAdministratorService

describe('Delete Administrator', () => {
  beforeEach(() => {
    administratorInMemoryRepository = new AdministratorInMemoryRepository()

    sut = new DeleteAdministratorService(administratorInMemoryRepository)
  })

  it('should be able to delete a administrator', async () => {
    const excluder = makeAdministrator(
      { role: AdministratorRole.FULL_ACCESS },
      new UniqueEntityId('excluder'),
    )
    const administrator = makeAdministrator(
      { role: AdministratorRole.EDITOR },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(excluder)
    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({
      administratorId: '1',
      excluderId: 'excluder',
    })

    expect(response.isRight()).toBe(true)
    expect(administratorInMemoryRepository.administrators).toHaveLength(2)

    const administratorDeleted =
      administratorInMemoryRepository.administrators.find((adm) =>
        adm.id.equals(administrator.id),
      )

    expect(administratorDeleted?.deletedAt).toBeInstanceOf(Date)
  })

  it('not should be able to delete a administrator with full access role', async () => {
    const excluder = makeAdministrator(
      { role: AdministratorRole.FULL_ACCESS },
      new UniqueEntityId('excluder'),
    )
    const administrator = makeAdministrator(
      { role: AdministratorRole.FULL_ACCESS },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(excluder)
    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({
      administratorId: '1',
      excluderId: 'excluder',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to delete a administrator with master role', async () => {
    const excluder = makeAdministrator(
      { role: AdministratorRole.FULL_ACCESS },
      new UniqueEntityId('excluder'),
    )
    const administrator = makeAdministrator(
      { role: AdministratorRole.MASTER },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(excluder)
    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({
      administratorId: '1',
      excluderId: 'excluder',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it("not should be able to delete a administrator if excluder doesn't existes", async () => {
    const administrator = makeAdministrator(
      { role: AdministratorRole.VIEWER },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({
      administratorId: '1',
      excluderId: 'excluder',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorNotFount)
  })

  it("not should be able to delete a administrator if it doesn't existes", async () => {
    const excluder = makeAdministrator(
      { role: AdministratorRole.FULL_ACCESS },
      new UniqueEntityId('excluder'),
    )

    await administratorInMemoryRepository.create(excluder)

    const response = await sut.execute({
      administratorId: 'inexistent-administrator',
      excluderId: 'excluder',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorToExcludeNotFound)
  })

  it('not should be able to delete a administrator if excluder not have role full access or master', async () => {
    const excluder = makeAdministrator(
      { role: AdministratorRole.EDITOR },
      new UniqueEntityId('excluder'),
    )
    const administrator = makeAdministrator(
      { role: AdministratorRole.VIEWER },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(excluder)
    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({
      administratorId: '1',
      excluderId: 'excluder',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })
})
