import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Music } from './music.entity';
import { User } from './user.entity';

@Entity({ name: 'recent_played' })
export class Recent_Played extends BaseEntity {
  @PrimaryGeneratedColumn()
  recent_played_id: number;

  @ManyToOne(() => Music, (music) => music.recent_played)
  @JoinColumn({ name: 'music_id' })
  music: Music;

  @ManyToOne(() => User, (user) => user.recent_played)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  played_at: Date;

  static async getRecentPlayedMusicByUserId(
    user_id: string,
    count: number,
  ): Promise<Music[]> {
    return await this.find({
      relations: {
        music: true,
        user: true,
      },
      where: {
        user: {
          user_id,
        },
      },
      select: {
        recent_played_id: false,
        music: {
          music_id: true,
          title: true,
          music_file: true,
          cover: true,
          genre: true,
        },
      },
      order: {
        played_at: 'DESC',
      },
      take: count,
    }).then((recent_played: Recent_Played[]) =>
      recent_played.map((recent) => recent.music),
    );
  }
}
