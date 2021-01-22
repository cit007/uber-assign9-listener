import { ObjectType, Field, Int } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from './core.entity';
import { Podcast } from './podcast.entity';

@Entity()
@ObjectType()
export class Comment extends CoreEntity {
  @Column()
  @Field(type => String)
  @IsString()
  content: string;

  @ManyToOne(() => Podcast, podcast => podcast.comments, {
    onDelete: 'CASCADE',
  })
  @Field(type => Podcast)
  podcast: Podcast;

  @Column()
  @Field(type => Int)
  userId: number;
}
