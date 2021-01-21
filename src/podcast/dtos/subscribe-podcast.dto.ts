import { ArgsType, ObjectType, Field, Int } from '@nestjs/graphql';
import { CoreOutput } from '../../users/dtos/output.dto';

@ArgsType()
export class SubscribePodcastInput {
  @Field(type => Int)
  podcastId: number;
}

@ObjectType()
export class SubscribePodcastOutput extends CoreOutput {}
