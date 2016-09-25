import { Robot } from 'hubot';
import Client from './client';

export interface RobotWithClient extends Robot {
  client: Client;
}
