import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CatchyException } from 'src/config/catchyException';
import { ERROR_CODE } from 'src/config/errorCode.enum';
import { PlaylistCreateDto } from 'src/dto/playlistCreate.dto';
import { Music } from 'src/entity/music.entity';
import { Music_Playlist } from 'src/entity/music_playlist.entity';
import { Playlist } from 'src/entity/playlist.entity';
import { Recent_Played } from 'src/entity/recent_played.entity';
import { HTTP_STATUS_CODE } from 'src/httpStatusCode.enum';
import { Repository } from 'typeorm';

@Injectable()
export class PlaylistService {
  private readonly logger = new Logger('PlaylistService');
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Music_Playlist)
    private music_playlistRepository: Repository<Music_Playlist>,
    @InjectRepository(Music)
    private MusicRepository: Repository<Music>,
    @InjectRepository(Recent_Played)
    private recentPlayedRepository: Repository<Recent_Played>,
  ) {}

  async createPlaylist(
    userId: string,
    playlistCreateDto: PlaylistCreateDto,
  ): Promise<number> {
    try {
      const title: string = playlistCreateDto.title;
      const newPlaylist: Playlist = this.playlistRepository.create({
        playlist_title: title,
        created_at: new Date(),
        updated_at: new Date(),
        user: { user_id: userId },
      });

      const result: Playlist = await this.playlistRepository.save(newPlaylist);
      const playlistId: number = result.playlist_id;
      return playlistId;
    } catch {
      this.logger.error(`playlist.service - createPlaylist : SERVICE_ERROR`);
      throw new CatchyException(
        'SERVER_ERROR',
        HTTP_STATUS_CODE.SERVER_ERROR,
        ERROR_CODE.SERVICE_ERROR,
      );
    }
  }

  async addMusicToPlaylist(
    userId: string,
    playlistId: number,
    musicId: string,
  ): Promise<number> {
    // 사용자 플리가 있는지 확인
    if (!(await this.isExistPlaylistOnUser(playlistId, userId))) {
      this.logger.error(
        `playlist.service - addMusicToPlaylist : NOT_EXIST_PLAYLIST_ON_USER`,
      );
      throw new CatchyException(
        'NOT_EXIST_PLAYLIST_ON_USER',
        HTTP_STATUS_CODE.BAD_REQUEST,
        ERROR_CODE.NOT_EXIST_PLAYLIST_ON_USER,
      );
    }
    // 음악 있는지 확인
    if (!(await this.isExistMusic(musicId))) {
      this.logger.error(
        `playlist.service - addMusicToPlaylist : NOT_EXIST_MUSIC`,
      );
      throw new CatchyException(
        'NOT_EXIST_MUSIC',
        HTTP_STATUS_CODE.BAD_REQUEST,
        ERROR_CODE.NOT_EXIST_MUSIC,
      );
    }

    // 이미 추가된 음악인지 확인
    if (await this.isAlreadyAdded(playlistId, musicId)) {
      this.logger.error(
        `playlist.service - addMusicToPlaylist : ALREADY_ADDED`,
      );
      throw new CatchyException(
        'ALREADY_ADDED',
        HTTP_STATUS_CODE.BAD_REQUEST,
        ERROR_CODE.ALREADY_ADDED,
      );
    }

    // 관계테이블에 추가
    try {
      const new_music_playlist: Music_Playlist =
        this.music_playlistRepository.create({
          music: { music_id: musicId },
          playlist: { playlist_id: playlistId },
          created_at: new Date(),
        });

      const result: Music_Playlist =
        await this.music_playlistRepository.save(new_music_playlist);
      this.setUpdatedAtNow(playlistId);
      return result.music_playlist_id;
    } catch {
      this.logger.error(
        `playlist.service - addMusicToPlaylist : SERVICE_ERROR`,
      );
      throw new CatchyException(
        'SERVER_ERROR',
        HTTP_STATUS_CODE.SERVER_ERROR,
        ERROR_CODE.SERVICE_ERROR,
      );
    }
  }

  async isAlreadyAdded(playlistId: number, musicId: string): Promise<boolean> {
    try {
      const count: number = await this.music_playlistRepository.countBy({
        music: { music_id: musicId },
        playlist: { playlist_id: playlistId },
      });
      return count !== 0;
    } catch {
      this.logger.error(`playlist.service - isAlreadyAdded : SERVICE_ERROR`);
      throw new CatchyException(
        'SERVER_ERROR',
        HTTP_STATUS_CODE.SERVER_ERROR,
        ERROR_CODE.SERVICE_ERROR,
      );
    }
  }

  async isExistPlaylistOnUser(
    playlistId: number,
    userId: string,
  ): Promise<boolean> {
    try {
      const playlistCount: number = await this.playlistRepository.countBy({
        playlist_id: playlistId,
        user: { user_id: userId },
      });
      return playlistCount !== 0;
    } catch {
      this.logger.error(
        `playlist.service - isExistPlaylistOnUser : SERVICE_ERROR`,
      );
      throw new CatchyException(
        'SERVER_ERROR',
        HTTP_STATUS_CODE.SERVER_ERROR,
        ERROR_CODE.SERVICE_ERROR,
      );
    }
  }

  async isExistMusic(musicId: string): Promise<boolean> {
    try {
      const musicCount: number = await this.MusicRepository.countBy({
        music_id: musicId,
      });

      return musicCount !== 0;
    } catch {
      this.logger.error(`playlist.service - isExistMusic : SERVICE_ERROR`);
      throw new CatchyException(
        'SERVER_ERROR',
        HTTP_STATUS_CODE.SERVER_ERROR,
        ERROR_CODE.SERVICE_ERROR,
      );
    }
  }

  async setUpdatedAtNow(playlistId: number): Promise<void> {
    try {
      const targetPlaylist: Playlist = await this.playlistRepository.findOne({
        where: { playlist_id: playlistId },
      });
      targetPlaylist.updated_at = new Date();
      this.playlistRepository.save(targetPlaylist);
    } catch {
      this.logger.error(`playlist.service - setUpdatedAtNow : SERVICE_ERROR`);
      throw new CatchyException(
        'SERVER_ERROR',
        HTTP_STATUS_CODE.SERVER_ERROR,
        ERROR_CODE.SERVICE_ERROR,
      );
    }
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    try {
      const playlists: Playlist[] = await Playlist.getPlaylistsByUserId(userId);
      const countPromises = playlists.map(async (playlist) => {
        playlist['music_count'] =
          await Music_Playlist.getMusicCountByPlaylistId(playlist.playlist_id);
      });
      const thumbnailPromises = playlists.map(async (playlist) => {
        const target = await Music_Playlist.getThumbnailByPlaylistId(
          playlist.playlist_id,
        );
        playlist['thumbnail'] = !target ? null : target.music.cover;
      });
      await Promise.all(countPromises);
      await Promise.all(thumbnailPromises);
      return playlists;
    } catch {
      this.logger.error(`playlist.service - getUserPlaylists : SERVICE_ERROR`);
      throw new CatchyException(
        'SERVER_ERROR',
        HTTP_STATUS_CODE.SERVER_ERROR,
        ERROR_CODE.SERVICE_ERROR,
      );
    }
  }

  async getPlaylistMusics(
    userId: string,
    playlistId: number,
  ): Promise<Music[]> {
    if (!(await this.isExistPlaylistOnUser(playlistId, userId))) {
      this.logger.error(
        `playlist.service - getPlaylistMusics : NOT_EXIST_PLAYLIST_ON_USER`,
      );
      throw new CatchyException(
        'NOT_EXIST_PLAYLIST_ON_USER',
        HTTP_STATUS_CODE.BAD_REQUEST,
        ERROR_CODE.NOT_EXIST_PLAYLIST_ON_USER,
      );
    }
    try {
      return Music_Playlist.getMusicListByPlaylistId(playlistId);
    } catch {
      this.logger.error(`playlist.service - getPlaylistMusics : SERVICE_ERROR`);
      throw new CatchyException(
        'SERVER_ERROR',
        HTTP_STATUS_CODE.SERVER_ERROR,
        ERROR_CODE.SERVICE_ERROR,
      );
    }
  }

  async getRecentMusicsByUserId(userId: string) {
    try {
      return Music_Playlist.getRecentPlayedMusicByUserId(userId);
    } catch {
      this.logger.error(
        `playlist.service - getRecentMusicsByUserId : SERVER_ERROR`,
      );
      throw new CatchyException(
        'SERVER ERROR',
        HTTP_STATUS_CODE.SERVER_ERROR,
        ERROR_CODE.SERVER_ERROR,
      );
    }
  }

  // async getRecentPlaylist(user_id: string): Promise<Playlist> {
  //   try {
  //     return await this.playlistRepository.findOne({
  //       where: {
  //         user: { user_id },
  //         playlist_title: RECENT_PLAYLIST_NAME,
  //       },
  //     });
  //   } catch {
  //     this.logger.error(`playlist.service - getRecentPlaylist : QUERY_ERROR`);
  //     throw new CatchyException(
  //       'QUERY_ERROR',
  //       HTTP_STATUS_CODE.SERVER_ERROR,
  //       ERROR_CODE.QUERY_ERROR,
  //     );
  //   }
  // }

  async isExistMusicInRecentPlaylist(
    music_id: string,
    user_id: string,
  ): Promise<boolean> {
    try {
      const musicCount: number = await this.recentPlayedRepository.count({
        where: { music: { music_id }, user: { user_id } },
      });
      return musicCount != 0;
    } catch {
      this.logger.error(
        `playlist.service - isExistMusicInRecentPlaylist : QUERY_ERROR`,
      );
      throw new CatchyException(
        'QUERY_ERROR',
        HTTP_STATUS_CODE.SERVER_ERROR,
        ERROR_CODE.QUERY_ERROR,
      );
    }
  }

  async updateRecentMusic(music_id: string, user_id: string): Promise<number> {
    try {
      if (!(await this.isExistMusicInRecentPlaylist(music_id, user_id))) {
        const newRow: Recent_Played = this.recentPlayedRepository.create({
          music: { music_id },
          user: { user_id },
          played_at: new Date(),
        });
        const addedRow: Recent_Played =
          await this.recentPlayedRepository.save(newRow);
        return addedRow.recent_played_id;
      }

      const targetRow: Recent_Played =
        await this.recentPlayedRepository.findOne({
          where: { music: { music_id }, user: { user_id } },
        });
      targetRow.played_at = new Date();
      const updatedRow: Recent_Played =
        await this.recentPlayedRepository.save(targetRow);
      return updatedRow.recent_played_id;
    } catch (err) {
      if (err instanceof CatchyException) throw err;

      this.logger.error(`playlist.service - updateRecentMusic : SERVICE_ERROR`);
      throw new CatchyException(
        'SERVICE_ERROR',
        HTTP_STATUS_CODE.SERVER_ERROR,
        ERROR_CODE.QUERY_ERROR,
      );
    }
  }

  // async updateRecentMusic(
  //   music_id: string,
  //   playlist_id: number,
  // ): Promise<number> {
  //   try {
  //     const music_playlist: Music_Playlist =
  //       await this.music_playlistRepository.findOne({
  //         where: { music: { music_id }, playlist: { playlist_id } },
  //       });

  //     music_playlist.created_at = new Date();
  //     const savedData: Music_Playlist =
  //       await this.music_playlistRepository.save(music_playlist);
  //     return savedData.music_playlist_id;
  //   } catch {
  //     this.logger.error(`playlist.service - updateRecentMusic : SERVICE_ERROR`);
  //     throw new CatchyException(
  //       'SERVICE_ERROR',
  //       HTTP_STATUS_CODE.SERVER_ERROR,
  //       ERROR_CODE.SERVICE_ERROR,
  //     );
  //   }
  // }
}
