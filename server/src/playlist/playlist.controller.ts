import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { AuthGuard } from '@nestjs/passport';
import { HTTP_STATUS_CODE } from 'src/httpStatusCode.enum';
import { PlaylistCreateDto } from 'src/dto/playlistCreate.dto';
import { Playlist } from 'src/entity/playlist.entity';
import { Music } from 'src/entity/music.entity';

@Controller('playlists')
export class PlaylistController {
  private readonly logger = new Logger('Playlist');
  constructor(private playlistService: PlaylistService) {}

  @Post()
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async createPlaylist(
    @Req() req,
    @Body() playlistCreateDto: PlaylistCreateDto,
  ): Promise<{ playlist_id: number }> {
    this.logger.log(
      `POST /playlists - nickname=${req.user.nickname}, body=${playlistCreateDto}`,
    );
    const userId: string = req.user.user_id;
    const playlistId: number = await this.playlistService.createPlaylist(
      userId,
      playlistCreateDto,
    );
    return { playlist_id: playlistId };
  }

  @Post(':playlistId')
  @UseGuards(AuthGuard())
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async addMusicToPlaylist(
    @Req() req,
    @Param('playlistId') playlistId: number,
    @Body('musicId') music_id: string,
  ): Promise<{ music_playlist_id: number }> {
    this.logger.log(
      `POST /playlists/${playlistId} - nickname=${req.user.nickname}, musicId=${music_id}`,
    );
    const userId: string = req.user.user_id;
    const music_playlist_id: number =
      await this.playlistService.addMusicToPlaylist(
        userId,
        playlistId,
        music_id,
      );
    return { music_playlist_id };
  }

  @Get()
  @UseGuards(AuthGuard())
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async getUserPlaylists(@Req() req): Promise<Playlist[]> {
    this.logger.log(`GET /playlists - nickname=${req.user.nickname}`);
    const userId: string = req.user.user_id;
    const playlists: Playlist[] =
      await this.playlistService.getUserPlaylists(userId);
    return playlists;
  }

  @Get(':playlistId')
  @UseGuards(AuthGuard())
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async getPlaylistMusics(
    @Req() req,
    @Param('playlistId') playlistId: number,
  ): Promise<Music[]> {
    this.logger.log(
      `GET /playlists/${playlistId} - nickname=${req.user.nickname}`,
    );
    const userId: string = req.user.user_id;
    return await this.playlistService.getPlaylistMusics(userId, playlistId);
  }

  @Delete()
  @UseGuards(AuthGuard())
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async deletePlaylist(
    @Req() req,
    @Body('playlistId') playlistId: number,
  ): Promise<{ playlistId: number }> {
    this.logger.log(
      `DELETE /playlists - nickname=${req.user.nickname}, playlistId=${playlistId}`,
    );
    const userId: string = req.user.user_id;
    const deletedPlaylistId: number =
      await this.playlistService.deleteSinglePlaylist(userId, playlistId);
    return { playlistId: deletedPlaylistId };
  }

  @Delete(':playlistId')
  @UseGuards(AuthGuard())
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async deleteMusicInPlaylist(
    @Req() req,
    @Param('playlistId') playlistId: number,
    @Body('musicId') music_id: string,
  ): Promise<{ music_playlist_id: number }> {
    this.logger.log(
      `DELETE /playlists/${playlistId} - nickname=${req.user.nickname}, musicId=${music_id}`,
    );
    const userId: string = req.user.user_id;
    const music_playlist_id: number =
      await this.playlistService.deleteMusicInPlaylist(
        userId,
        playlistId,
        music_id,
      );
    return { music_playlist_id };
  }
}
