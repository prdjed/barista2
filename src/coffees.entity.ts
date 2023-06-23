import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity('coffees')
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  duration: number;

  @Column()
  grams: number;

}