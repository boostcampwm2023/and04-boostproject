import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository, DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Playlist } from 'src/entity/playlist.entity';
import { Music } from 'src/entity/music.entity';
import { Music_Playlist } from 'src/entity/music_playlist.entity';
import { Logger } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRepository } from 'src/user/user.repository';
import { MusicRepository } from 'src/music/music.repository';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let jwtModule: JwtModule;
  let userRepository: UserRepository;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule,
        CacheModule.register({}),
        ConfigModule,
      ],
      controllers: [AuthController],
      providers: [
        Logger,
        AuthService,
        ConfigService,
        {
          provide: UserRepository,
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Playlist),
          useClass: Repository,
        },
        {
          provide: MusicRepository,
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Music_Playlist),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jwtModule = module.get<JwtModule>(JwtModule);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
