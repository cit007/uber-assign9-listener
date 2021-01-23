import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '../jwt/jwt.service';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { SubscribePodcastInput } from './dtos/subscribe-podcast.dto';
import { SearchPodcastOutput } from 'src/podcast/dtos/search-podcast.dto';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import {
  SeeSubscriptionInput,
  SeeSubscriptionOutput,
} from './dtos/see-subscription.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Podcast)
    private readonly podcastRepository: Repository<Podcast>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: `There is a user with that email already` };
      }
      const user = this.users.create({
        email,
        password,
        role,
      });
      await this.users.save(user);

      return {
        ok: true,
        error: null,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create account',
      };
    }
  }
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }

      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'User Not Found',
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOneOrFail(userId);

      if (email) user.email = email;
      if (password) user.password = password;

      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not update profile',
      };
    }
  }

  async subscribePodcast(
    authUser: User,
    subscribePodcastInput: SubscribePodcastInput,
  ): Promise<SearchPodcastOutput> {
    try {
      const { podcastId } = subscribePodcastInput;
      const { id } = authUser;
      const podcast = await this.podcastRepository.findOne({ id: podcastId });
      const listener = await this.users.findOne({ id });
      if (!podcast || !listener) {
        return {
          ok: false,
          error: 'Could not subscribe podcast',
        };
      }

      console.log('###subscriptions1 :', listener);
      // IF CLIENT SUBSCRIBE THE PODCAST, TOGGLE IT. OTHERWISE, ADD IT
      if (listener.subscriptions.some(item => item.id === podcast.id)) {
        listener.subscriptions = listener.subscriptions.filter(
          item => item.id !== podcast.id,
        );
      } else {
        listener.subscriptions.push(podcast);
      }

      console.log('###subscriptions2 :', listener);
      this.users.save(listener);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not subscribe podcast',
      };
    }
  }

  async seeSubscriptions(
    authUser: User,
    seeSubscriptionsInput: SeeSubscriptionInput,
  ): Promise<SeeSubscriptionOutput> {
    try {
      const { userId } = seeSubscriptionsInput;
      const listener = await this.users.findOne({ id: userId });
      if (!listener) {
        return {
          ok: false,
          error: 'Could not find subscription-podcast',
        };
      }
      return { ok: true, podcasts: listener.subscriptions };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not find subscription-podcast',
      };
    }
  }
}
