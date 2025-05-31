import { Module } from '@nestjs/common';
import { DeliveryWsService } from './delivery-ws.service';
import { DeliveryWsGateway } from './delivery-ws.gateway';

@Module({
  providers: [DeliveryWsGateway, DeliveryWsService],
})
export class DeliveryWsModule {}
