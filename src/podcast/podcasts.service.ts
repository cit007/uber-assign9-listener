import { Injectable } from '@nestjs/common';
import {
  CreateEpisodeInput,
  CreateEpisodeOutput,
} from './dtos/create-episode.dto';
import {
  CreatePodcastInput,
  CreatePodcastOutput,
} from './dtos/create-podcast.dto';
import { UpdateEpisodeInput } from './dtos/update-episode.dto';
import { UpdatePodcastInput } from './dtos/update-podcast.dto';
import { Episode } from './entities/episode.entity';
import { Podcast } from './entities/podcast.entity';
import { CoreOutput } from './dtos/output.dto';
import {
  PodcastOutput,
  EpisodesOutput,
  EpisodesSearchInput,
  GetAllPodcastsOutput,
  GetEpisodeOutput,
} from './dtos/podcast.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import {
  SearchPodcastInput,
  SearchPodcastOutput,
} from './dtos/search-podcast.dto';
import { SubscribePodcastInput } from '../users/dtos/subscribe-podcast.dto';
import {
  SeeSubscriptionInput,
  SeeSubscriptionOutput,
} from '../users/dtos/see-subscription.dto';
import {
  CreateCommentInput,
  CreateCommentOutput,
} from './dtos/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class PodcastsService {
  constructor(
    @InjectRepository(Podcast)
    private readonly podcastRepository: Repository<Podcast>,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  private readonly InternalServerErrorOutput = {
    ok: false,
    error: 'Internal server error occurred.',
  };

  async getAllPodcasts(): Promise<GetAllPodcastsOutput> {
    try {
      const podcasts = await this.podcastRepository.find();
      return {
        ok: true,
        podcasts,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async createPodcast({
    title,
    category,
  }: CreatePodcastInput): Promise<CreatePodcastOutput> {
    try {
      const newPodcast = this.podcastRepository.create({ title, category });
      const { id } = await this.podcastRepository.save(newPodcast);
      return {
        ok: true,
        id,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async getPodcast(id: number): Promise<PodcastOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(
        { id },
        { relations: ['episodes'] },
      );
      if (!podcast) {
        return {
          ok: false,
          error: `Podcast with id ${id} not found`,
        };
      }
      return {
        ok: true,
        podcast,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async deletePodcast(id: number): Promise<CoreOutput> {
    try {
      const { ok, error } = await this.getPodcast(id);
      if (!ok) {
        return { ok, error };
      }
      await this.podcastRepository.delete({ id });
      return { ok };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async updatePodcast({
    id,
    payload,
  }: UpdatePodcastInput): Promise<CoreOutput> {
    try {
      const { ok, error, podcast } = await this.getPodcast(id);
      if (!ok) {
        return { ok, error };
      }

      if (
        payload.rating !== null &&
        (payload.rating < 1 || payload.rating > 5)
      ) {
        return {
          ok: false,
          error: 'Rating must be between 1 and 5.',
        };
      } else {
        const updatedPodcast: Podcast = { ...podcast, ...payload };
        await this.podcastRepository.save(updatedPodcast);
        return { ok };
      }
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async searchPodcasts(
    authUser: User,
    searchPodcastInput: SearchPodcastInput,
  ): Promise<SearchPodcastOutput> {
    try {
      const { title } = searchPodcastInput;
      console.log('searchPodcasts:', title);
      const podcasts = await this.podcastRepository.find({
        where: { title: ILike(`%${title}%`) },
      });
      if (!podcasts) {
        return {
          ok: false,
          error: 'Could not search podcast',
        };
      }

      return { ok: true, podcasts: podcasts };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not search podcast',
      };
    }
  }

  // async subscribePodcast(
  //   authUser: User,
  //   subscribePodcastInput: SubscribePodcastInput,
  // ): Promise<SearchPodcastOutput> {
  //   try {
  //     const { podcastId } = subscribePodcastInput;
  //     const { id } = authUser;
  //     const podcast = await this.podcastRepository.findOne({ id: podcastId });
  //     const user = await this.userRepository.findOne({ id });
  //     if (!podcast || !user) {
  //       return {
  //         ok: false,
  //         error: 'Could not subscribe podcast',
  //       };
  //     }

  //     podcast.user = user;
  //     this.podcastRepository.save(podcast);
  //     return {
  //       ok: true,
  //     };
  //   } catch (error) {
  //     return {
  //       ok: false,
  //       error: 'Could not subscribe podcast',
  //     };
  //   }
  // }

  // async seeSubscriptions(
  //   authUser: User,
  //   seeSubscriptionsInput: SeeSubscriptionInput,
  // ): Promise<SeeSubscriptionOutput> {
  //   try {
  //     const { userId } = seeSubscriptionsInput;
  //     console.log('seeSubscriptionsInput id:', userId);
  //     const user = await this.userRepository.findOne({ id: userId });
  //     console.log('seeSubscriptionsInput user:', user);
  //     const podcasts = await this.podcastRepository.find({ user });
  //     console.log('seeSubscriptionsInput podcast:', podcasts);
  //     if (!podcasts || !user) {
  //       return {
  //         ok: false,
  //         error: 'Could not find subscription-podcast',
  //       };
  //     }

  //     return { ok: true, podcasts: podcasts };
  //   } catch (error) {
  //     return {
  //       ok: false,
  //       error: 'Could not find subscription-podcast',
  //     };
  //   }
  // }

  async createComment(
    authUser: User,
    createCommentInput: CreateCommentInput,
  ): Promise<CreateCommentOutput> {
    try {
      const userId = authUser.id;
      const { postId, content } = createCommentInput;

      const podcast = await this.podcastRepository.findOne({ id: postId });
      const user = await this.userRepository.findOne({ id: userId });
      if (!podcast || !user) {
        return {
          ok: false,
          error: 'Could not create comment',
        };
      }
      const comment = await this.commentRepository.create({ content });
      comment.podcast = podcast;
      comment.user = user;
      await this.commentRepository.save(comment);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create comment',
      };
    }
  }

  async getEpisodes(podcastId: number): Promise<EpisodesOutput> {
    const { podcast, ok, error } = await this.getPodcast(podcastId);
    if (!ok) {
      return { ok, error };
    }
    return {
      ok: true,
      episodes: podcast.episodes,
    };
  }

  async getEpisode({
    podcastId,
    episodeId,
  }: EpisodesSearchInput): Promise<GetEpisodeOutput> {
    const { episodes, ok, error } = await this.getEpisodes(podcastId);
    if (!ok) {
      return { ok, error };
    }
    const episode = episodes.find(episode => episode.id === episodeId);
    if (!episode) {
      return {
        ok: false,
        error: `Episode with id ${episodeId} not found in podcast with id ${podcastId}`,
      };
    }
    return {
      ok: true,
      episode,
    };
  }

  async createEpisode({
    podcastId,
    title,
    category,
  }: CreateEpisodeInput): Promise<CreateEpisodeOutput> {
    try {
      const { podcast, ok, error } = await this.getPodcast(podcastId);
      if (!ok) {
        return { ok, error };
      }
      const newEpisode = this.episodeRepository.create({ title, category });
      newEpisode.podcast = podcast;
      const { id } = await this.episodeRepository.save(newEpisode);
      return {
        ok: true,
        id,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async deleteEpisode({
    podcastId,
    episodeId,
  }: EpisodesSearchInput): Promise<CoreOutput> {
    try {
      const { episode, error, ok } = await this.getEpisode({
        podcastId,
        episodeId,
      });
      if (!ok) {
        return { ok, error };
      }
      await this.episodeRepository.delete({ id: episode.id });
      return { ok: true };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async updateEpisode({
    podcastId,
    episodeId,
    ...rest
  }: UpdateEpisodeInput): Promise<CoreOutput> {
    try {
      const { episode, ok, error } = await this.getEpisode({
        podcastId,
        episodeId,
      });
      if (!ok) {
        return { ok, error };
      }
      const updatedEpisode = { ...episode, ...rest };
      await this.episodeRepository.save(updatedEpisode);
      return { ok: true };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }
}
