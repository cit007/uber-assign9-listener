import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { Podcast } from 'src/podcast/entities/podcast.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Podcast])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
