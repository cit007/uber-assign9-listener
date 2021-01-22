import { ArgsType, ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import { CoreOutput } from '../../users/dtos/output.dto';

@InputType()
export class CreateCommentInput {
  @Field(type => Int)
  userId: number;

  @Field(type => Int)
  postId: number;

  @Field(type => String)
  content: string;
}

@ObjectType()
export class CreateCommentOutput extends CoreOutput {}
