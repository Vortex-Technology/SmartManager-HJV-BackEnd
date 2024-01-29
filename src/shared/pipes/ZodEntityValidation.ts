import { InternalServerErrorException, PipeTransform } from '@nestjs/common'
import { ZodError, ZodSchema } from 'zod'
import { fromZodError } from 'zod-validation-error'

export class ZodEntityValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (err) {
      if (err instanceof ZodError) {
        console.log(JSON.stringify(err, null, 2))

        throw new InternalServerErrorException({
          errors: fromZodError(err),
          message: 'Cant be validate received data',
          statusCode: 500,
        })
      }

      throw new InternalServerErrorException('Cant be validate received data')
    }
  }
}
