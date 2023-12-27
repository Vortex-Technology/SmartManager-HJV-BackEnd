import { Administrator } from '../entities/Administrator'

export abstract class AdministratorRepository {
  abstract create(administrator: Administrator): Promise<void>
  abstract findByLogin(login: string): Promise<Administrator | null>
  abstract findById(id: string): Promise<Administrator | null>
  abstract save(administrator: Administrator): Promise<void>
}
