import { Administrator } from '@modules/administrator/entities/Administrator'
import { AdministratorRepository } from '@modules/administrator/repositories/AdministratorRepository'

export class AdministratorInMemoryRepository
  implements AdministratorRepository
{
  administrators: Administrator[] = []

  async create(administrator: Administrator): Promise<void> {
    this.administrators.push(administrator)
  }

  async findByLogin(login: string): Promise<Administrator | null> {
    const administrator = this.administrators.find(
      (administrator) => administrator.login === login,
    )

    if (!administrator) return null

    return administrator
  }

  async findById(id: string): Promise<Administrator | null> {
    const administrator = this.administrators.find(
      (administrator) => administrator.id.toString() === id,
    )

    if (!administrator) return null

    return administrator
  }

  async save(administrator: Administrator): Promise<void> {
    const administratorIndex = this.administrators.findIndex((adm) =>
      adm.equals(administrator),
    )

    this.administrators[administratorIndex] = administrator
  }
}
