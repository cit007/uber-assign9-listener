import { Module } from '@nestjs/common';
import { PodcastsService } from './podcasts.service';
import {
  CommentResolver,
  EpisodeResolver,
  PodcastsResolver,
} from './podcasts.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Podcast } from './entities/podcast.entity';
import { Episode } from './entities/episode.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Podcast, Episode, User, Comment])],
  providers: [
    PodcastsService,
    PodcastsResolver,
    EpisodeResolver,
    CommentResolver,
  ],
})
export class PodcastsModule {}
