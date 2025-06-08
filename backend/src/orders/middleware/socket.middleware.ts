import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { OrdersGateway } from 'src/orders/orders.gateway';

export interface RequestWithIO extends Request {
  io?: OrdersGateway;
}

@Injectable()
export class SocketMiddleware implements NestMiddleware {
  constructor(private readonly ordersGateway: OrdersGateway) {}

  use(req: RequestWithIO, res: Response, next: NextFunction) {
    req.io = this.ordersGateway;
    next();
  }
}
