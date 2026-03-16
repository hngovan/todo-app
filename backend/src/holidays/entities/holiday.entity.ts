import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'

@Entity('holidays')
@Index(['date', 'countryCode'], { unique: true })
export class Holiday {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'date' })
  date: string

  @Column()
  name: string

  @Column()
  localName: string

  @Column({ length: 2, default: 'VN' })
  countryCode: string
}
