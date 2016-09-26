// Description:
//   Self service team and user administration scripts.
//
// Configuration:
//   HACKBOT_PASSWORD: required
//   HACK24API_URL: required
//
// Commands:
//   hubot can you see the api? - checks if the API is visible
//   hubot what are your prime directives? - cites hubot's prime directives
//   hubot my id - echos the ID hubot knows you as
//   hubot create team <team name> - tries to create team with name <team name> and adds you to it
//   hubot leave my team - removes you from your current team
//   hubot find teams like <query> - displays up to three teams matching the specified query
//   hubot tell me about team <team name> - displays information about the specific team
//   hubot add @<username> to my team - adds @<username> to your team
//   hubot tell me about my team - displays information about your team
//
// Author:
//   David Wood <david.p.wood@gmail.com>
//

import Client from './client';
import { RobotWithClient } from './hackbot';
import Config from './config';

import ErrorScript from './scripts/error.script';

import AddUsernameToMyTeamScript from './scripts/add_username_to_my_team.script';
import CanYouSeeTheApiScript from './scripts/can_you_see_the_api.script';
import CreateTeamScript from './scripts/create_team.script';
import FindTeamsLikeScript from './scripts/find_teams_like.script';
import LeaveMyTeamScript from './scripts/leave_my_team.script';
import MyIdScript from './scripts/my_id.script';
import OurMottoIsScript from './scripts/our_motto_is.script';
import PrimeDirectivesScript from './scripts/prime_directives.script';
import TellMeAboutMyTeamScript from './scripts/tell_me_about_my_team.script';
import TellMeAboutTeamScript from './scripts/tell_me_about_team.script';

function load(robot: RobotWithClient) {
  robot.client = new Client(Config.api_url, Config.api_password, robot);

  ErrorScript(robot);

  AddUsernameToMyTeamScript(robot);
  CanYouSeeTheApiScript(robot);
  CreateTeamScript(robot);
  FindTeamsLikeScript(robot);
  LeaveMyTeamScript(robot);
  MyIdScript(robot);
  OurMottoIsScript(robot);
  PrimeDirectivesScript(robot);
  TellMeAboutMyTeamScript(robot);
  TellMeAboutTeamScript(robot);
}

export = load;
