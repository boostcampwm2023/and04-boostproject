import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaylistCreateDto } from 'src/dto/playlistCreate.dto';
import { Music } from 'src/entity/music.entity';
import { Music_Playlist } from 'src/entity/music_playlist.entity';
import { Playlist } from 'src/entity/playlist.entity';
import { HTTP_STATUS_CODE } from 'src/httpStatusCode.enum';
import { Repository } from 'typeorm';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Music_Playlist)
    private music_playlistRepository: Repository<Music_Playlist>,
    @InjectRepository(Music)
    private MusicRepository: Repository<Music>,
  ) {}

  async createPlaylist(
    userId: string,
    playlistCreateDto: PlaylistCreateDto,
  ): Promise<number> {
    const title: string = playlistCreateDto.title;
    const newPlaylist: Playlist = this.playlistRepository.create({
      playlist_title: title,
      created_at: new Date(),
      updated_at: new Date(),
      user: { user_id: userId },
    });

    const result: Playlist = await this.playlistRepository.save(newPlaylist);
    const playlistId: number = result.playlist_Id;
    return playlistId;
  }

  async addMusicToPlaylist(
    userId: string,
    playlistId: number,
    musicId: number,
  ): Promise<number> {
    // 사용자 플리가 있는지 확인
    if (!(await this.isExistPlaylistOnUser(playlistId, userId))) {
      throw new HttpException(
        'NOT_EXIST_PLAYLIST_ON_USER',
        HTTP_STATUS_CODE.BAD_REQUEST,
      );
    }
    // 음악 있는지 확인
    if (!(await this.isExistMusic(musicId))) {
      throw new HttpException('NOT_EXIST_MUSIC', HTTP_STATUS_CODE.BAD_REQUEST);
    }

    // 관계테이블에 추가
    const new_music_playlist: Music_Playlist =
      this.music_playlistRepository.create({
        music: { musicId: musicId },
        playlist: { playlist_Id: playlistId },
      });

    const result: Music_Playlist =
      await this.music_playlistRepository.save(new_music_playlist);
    return result.music_playlist_id;
  }

  async isExistPlaylistOnUser(
    playlistId: number,
    userId: string,
  ): Promise<boolean> {
    const playlistCount: number = await this.playlistRepository.countBy({
      playlist_Id: playlistId,
      user: { user_id: userId },
    });
    return playlistCount !== 0;
  }

  async isExistMusic(musicId: number): Promise<boolean> {
    const musicCount: number = await this.MusicRepository.countBy({
      musicId: musicId,
    });

    return musicCount !== 0;
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const playlists: Playlist[] = await this.playlistRepository.find({
      select: { playlist_Id: true, playlist_title: true },
      where: {
        user: { user_id: userId },
      },
      order: {
        updated_at: 'ASC',
      },
    });

    return playlists;
  }
}
