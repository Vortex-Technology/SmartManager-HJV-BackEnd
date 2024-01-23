import { ValidateApiKeyService } from '@modules/company/services/ValidateApiKey.service'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly validateApiKeyService: ValidateApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const apiKey = request.headers['x-api-key']

    if (!apiKey) {
      return false
    }

    const response = await this.validateApiKeyService.execute({
      key: apiKey,
    })

    if (response.isLeft()) {
      return false
    }

    return true
  }
}
