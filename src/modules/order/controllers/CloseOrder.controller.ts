
import { CloseOrderBody, closeOrderBodyValidationPipe } from '../gateways/CloseOrder.gateway'
import { CloseOrderService } from '../services/CloseOrder.service'
import { Body, Controller, Post, HttpCode } from '@nestjs/common'



@Controller()
export class CloseOrderController {
  constructor() {}

  
  @Post();@HttpCode();
  handle (@Body() body: CloseOrderBody)  {}
}


