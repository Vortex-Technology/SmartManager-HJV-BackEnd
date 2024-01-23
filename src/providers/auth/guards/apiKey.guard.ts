import { ValidateApiKeyService } from '@modules/company/services/ValidateApiKey.service'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Decoder } from '@providers/cryptography/contracts/decoder'
import { tokenPayloadSchema } from '../strategys/jwtStrategy'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly validateApiKeyService: ValidateApiKeyService,
    private readonly decoder: Decoder,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const _apiKey = request.headers['x-api-key']
    const collaboratorToken = request.headers['x-collaborator-access-token']

    if (!_apiKey || !collaboratorToken) {
      return false
    }

    const response = await this.validateApiKeyService.execute({
      key: _apiKey,
    })

    if (response.isLeft() || !response.value.apiKey) {
      return false
    }

    const { apiKey } = response.value

    const { isValid, payload } = await this.decoder.decrypt(collaboratorToken, {
      secret: apiKey.secret,
    })

    if (!isValid || !payload) {
      return false
    }

    const validation = tokenPayloadSchema.safeParse(payload)

    if (!validation.success) {
      return false
    }

    const { data } = validation

    context.switchToHttp().getRequest().user = data

    return true
  }
}
