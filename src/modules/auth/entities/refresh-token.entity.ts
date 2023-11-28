import { SiteUser } from '../../users/entities';
import { CustomBaseEntity } from 'src/shared/entities';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'refreshToken' })
export class RefreshToken extends CustomBaseEntity {
  @Column()
  token: string;

  @ManyToOne((type) => SiteUser, (siteUser) => siteUser.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  siteUser: SiteUser;
}
