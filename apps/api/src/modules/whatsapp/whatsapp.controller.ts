import { Body, Controller, Post } from '@nestjs/common';

import { CreateWhatsAppPurchaseRequestDto } from './dto/whatsapp.dto';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('purchase-request')
  createPurchaseRequest(@Body() dto: CreateWhatsAppPurchaseRequestDto) {
    return this.whatsappService.createPurchaseRequest(dto);
  }
}
