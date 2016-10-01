import { Robot } from 'hubot-slack';
import Client from './client';

export interface RobotWithClient extends Robot {
  client: Client;
}
