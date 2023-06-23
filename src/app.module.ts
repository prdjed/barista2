import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './coffees.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot(), TypeOrmModule.forFeature([Coffee]), TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'microservice_coffee',
    entities: [Coffee],
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
  providers: [AppService],
})
export class AppModule { }
