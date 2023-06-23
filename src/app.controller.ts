import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}



  @EventPattern('newOrder')
  handleNewOrder(coffees) {
    this.appService.handleNewOrder(coffees);
  }
}
