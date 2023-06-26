import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './coffees.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Queue } from './queue.entity';
import { QueueSubscriber } from './queue.subscriber';
import { CreateSubscriber } from './types';

@Module({
  imports: [EventEmitterModule.forRoot(), TypeOrmModule.forFeature([Coffee, Queue]), TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '12345678',
    database: 'coffee_shop',
    entities: [Coffee, Queue],
    autoLoadEntities: true,
    synchronize: true,
  }), ClientsModule.register([
    {
      name: 'BARMAN',
      transport: Transport.TCP,
      options: {
        port: 3001
      }
    }])],
  controllers: [AppController],
  providers: [AppService, QueueSubscriber],
})
export class AppModule { }
