import { ArgsType, ObjectType, Field } from '@nestjs/graphql';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import { User } from '../../users/entities/user.entity';
import { CoreOutput } from '../../users/dtos/output.dto';

@ArgsType()
export class SearchPodcastInput {
  @Field(type => String)
  title: string;
}

@ObjectType()
export class SearchPodcastOutput extends CoreOutput {
  @Field(type => [Podcast], { nullable: true })
  podcasts?: Podcast[];
}
