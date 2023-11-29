import {
  Body,
  Controller,
  Req,
  HttpCode,
  Post,
  Get,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { HTTP_STATUS_CODE } from 'src/httpStatusCode.enum';
import { MusicCreateDto } from 'src/dto/musicCreate.dto';
import { AuthGuard } from '@nestjs/passport';
import { Genres } from 'src/constants';
import { Music } from 'src/entity/music.entity';

@Controller('musics')
export class MusicController {
  private objectStorage: AWS.S3;
  constructor(private readonly musicService: MusicService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard())
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async upload(
    @Body() musicCreateDto: MusicCreateDto,
    @Req() req,
  ): Promise<{ music_id: string }> {
    const userId = req.user.user_id;
    const savedMusicId: string = await this.musicService.createMusic(
      musicCreateDto,
      userId,
    );
    return { music_id: savedMusicId };
  }

  @Get('recent-uploads')
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async getRecentMusics(): Promise<Music[]> {
    const musics = this.musicService.getRecentMusic();

    return musics;
  }

  @Get('genres')
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  getGenres(): { genres: string[] } {
    const genreName: string[] = Object.keys(Genres);

    return { genres: genreName };
  }

  @Get('my-uploads')
  @UseGuards(AuthGuard())
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async getMyUploads(
    @Req() req,
    @Query('count') count: number,
  ): Promise<Music[]> {
    const userId: string = req.user.user_id;
    return this.musicService.getMyUploads(userId, count);
  }

  @Get('info')
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async getMusicInfo(@Query('music_id') music_id: string): Promise<Music> {
    return this.musicService.getMusicInfo(music_id);
  }

  @Get('ts')
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async getEncodedChunkFiles(
    @Query('music_id') music_id: string,
    @Query('fileName') fileName: string,
  ): Promise<{ file: AWS.S3.Body }> {
    return {
      file: await this.musicService.getEncodedChunkFiles(music_id, fileName),
    };
  }
}
