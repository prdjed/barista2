import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Coffee } from './coffees.entity';
import { Repository, DataSource } from 'typeorm';
import { Queue } from './queue.entity';
import {Client} from 'pg'

@Injectable()
export class AppService {

  private isAvailable = true;
  private amountOfCoffee = 300;

  constructor(@InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Queue) private queueRepository: Repository<Queue>,
    @InjectRepository(Coffee) private coffees: Repository<Coffee>,) { }

  async handleNewOrder() {
    const client = new Client({
      connectionString:"postgres"
    })
    console.log(client);
    console.log('Barista available: ' +this.isAvailable)
    if (this.isAvailable) {
      //starting tansaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const order = await queryRunner.manager.createQueryBuilder().select().from(Queue, 'queue').where('queue.is_done = :is_done',{is_done: false}).orderBy('queue.time_created', 'ASC').limit(1).execute();
        const query = await queryRunner.manager.query(
          `UPDATE queue SET is_done = true WHERE  queue.id =(SELECT queue.id FROM queue WHERE queue.id=${order[0].id} FOR UPDATE SKIP LOCKED)`
        );
        this.isAvailable = false;

        console.log('Barista started making coffee.')
        await this.sleep(10000);
        console.log('Order finished.')
        this.isAvailable = true;
        
        await queryRunner.commitTransaction();
        return query;
      } catch (err) {
        console.log(err)
      } finally {
        // const more = await queryRunner.manager.createQueryBuilder().select().from(Queue, 'queue').where('queue.time_created>0').execute()
        // if (more.length > 0) {
          //   this.handleNewOrder();
          // }
          await queryRunner.release();
        }
        
      }
      // let timeToDo = 0;
      // let amountOfCoffee = 0;
      // for (let i = 0; i < coffeesToMake.length; i++) {
        //   timeToDo += coffeesToMake[i].duration * quantities[i];
        //   amountOfCoffee += coffeesToMake[i].grams * quantities[i];
        // }
      }
      sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    }
    