import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('queue')
export class Queue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  espresso_quantity: number;

  @Column()
  espresso_dopio_quantity: number;

  @Column()
  cappuccino_quantity: number;

  @Column({default: Date.now(), type:'bigint'})
  time_created: string;

  @Column({default: false})
  is_done: boolean;
}