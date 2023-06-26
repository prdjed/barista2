import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Queue } from './queue.entity';
import { AppService } from './app.service';

@EventSubscriber()
export class QueueSubscriber implements EntitySubscriberInterface<Queue> {

  constructor(dataSource: DataSource, private readonly appService: AppService) {
    dataSource.subscribers.push(this)
  }

  listenTo() {
    return Queue;
  }

  afterInsert(event: InsertEvent<Queue>) {
    console.log(event.entity)
    this.appService.handleNewOrder();
  }
}