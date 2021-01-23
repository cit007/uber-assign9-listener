import { ArgsType, ObjectType, Field, Int } from '@nestjs/graphql';
import { Episode } from 'src/podcast/entities/episode.entity';
import { CoreOutput } from './output.dto';

@ArgsType()
export class PlayEpisodeInput {
  @Field(type => Int)
  episodeId: number;
}

@ObjectType()
export class PlayEpisodeOutput extends CoreOutput {
  @Field(type => [Episode], { nullable: true })
  episodes?: Episode[];
}
