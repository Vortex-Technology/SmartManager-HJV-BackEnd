export abstract class StorageRepository {
  abstract upload(filename: string): Promise<string | null>
}
