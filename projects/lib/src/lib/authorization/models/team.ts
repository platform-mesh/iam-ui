import { TeamConnection } from './team-connection';

export interface Team {
  name: string;
  parentTeam?: Team;
  childTeams: TeamConnection;
}
