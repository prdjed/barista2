import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Coffee } from './coffees.entity';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AppService {

  private isAvailable = true;
  private amountOfCoffee = 300;


  constructor(@Inject('BARMAN') private readonly barmanClient: ClientProxy, @InjectRepository(Coffee) private bartenderRepository: Repository<Coffee>, @InjectDataSource() private dataSource: DataSource, private eventEmitter: EventEmitter2) { }

  async handleNewOrder(coffees) {
    console.log(this.isAvailable)
    if (!this.isAvailable) {
      this.barmanClient.emit('notAvailable', coffees)
      return
    }
    // this.barmanClient.emit('available', coffees)

    const coffeesInOrder = coffees.map(a => a.type)
    const quantities = coffees.map(b => b.quantity)
    const coffeesToMake = await this.dataSource.getRepository(Coffee).createQueryBuilder('coffees').where('coffees.type IN (:...types)', { types: [coffeesInOrder] }).getMany();

    let timeToDo = 0;
    let amountOfCoffee = 0;
    for (let i = 0; i < coffeesToMake.length; i++) {
      timeToDo += coffeesToMake[i].duration * quantities[i];
      amountOfCoffee += coffeesToMake[i].grams * quantities[i];
    }
    const payload = {
      coffees,
      timeToDo
    }

    this.eventEmitter.emit('makingCoffee', payload);

    this.isAvailable = false
    return console.log('barista confirmed order' + coffees)
    // return this.barmanClient.emit('orderConfirmed', coffees);
  }

  @OnEvent('makingCoffee')
  async handleCoffeeMaking(payload) {

    await new Promise<void>((resolve) => setTimeout(() => resolve(), payload.timeToDo * 1000));
    this.isAvailable = true;
    console.log('barista finished order')
    this.barmanClient.emit('orderFinished', payload.coffees)
  }

  
}
