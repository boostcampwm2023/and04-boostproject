import {
  Body,
  Controller,
  Req,
  HttpCode,
  HttpException,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { HTTP_STATUS_CODE } from 'src/httpStatusCode.enum';
import { MusicCreateDto } from 'src/dto/musicCreate.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('musics')
export class MusicController {
  constructor(private musicService: MusicService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard())
  @HttpCode(HTTP_STATUS_CODE.SUCCESS)
  async upload(@Body() musicCreateDto: MusicCreateDto, @Req() req) {
    try {
      const userId = req.user.user_id;

      this.musicService.createMusic(musicCreateDto, userId);

      return { userId };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('WRONG TOKEN', HTTP_STATUS_CODE['WRONG TOKEN']);
    }
  }
}