import { PageInfo } from './page-info';
import { Team } from './team';

export interface TeamConnection {
  teams: Team[];
  pageInfo: PageInfo;
}
