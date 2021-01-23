import { ArgsType, ObjectType, Field, Int } from '@nestjs/graphql';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import { CoreOutput } from '../../users/dtos/output.dto';

@ArgsType()
export class SeeSubscriptionInput {
  @Field(type => Int)
  userId: number;
}

@ObjectType()
export class SeeSubscriptionOutput extends CoreOutput {
  @Field(type => [Podcast], { nullable: true })
  podcasts?: Podcast[];
}
