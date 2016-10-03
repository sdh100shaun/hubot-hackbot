import { Response } from 'hubot';
import { AugmentedRobot } from '../async';

async function addUserToTeam(
  robot: AugmentedRobot,
  response: Response,
  teamId: string,
  otherUserId: string,
  otherUsername: string,
  emailAddress: string
) {
  const res = await robot.client.addUserToTeam(teamId, otherUserId, emailAddress);
  if (res.statusCode === 400) {
    return response.reply(`Sorry, ${otherUsername} is already in another team and must leave that team first.`);
  }

  if (res.statusCode === 403) {
    return response.reply(`Sorry, you don't have permission to add people to your team.`);
  }

  response.reply('Done!');
}

export default (robot: AugmentedRobot) => {

  robot.respondAsync(/add @([a-z0-9.\-_]+)\s+to my team/, async (response) => {
    const otherUsername = response.match[1];
    const dataStore = robot.adapter.client.rtm.dataStore;
    const user = dataStore.getUserById(response.message.user.id);

    const userResponse = await robot.client.getUser(user.id);

    if (userResponse.user.team.id === undefined) {
      return response.reply(`I would, but you're not in a team...`);
    }

    const teamId = userResponse.user.team.id;
    const otherUser = dataStore.getUserByName(otherUsername);
    const emailAddress = user.profile.email;

    const _userResponse = await robot.client.getUser(otherUser.id);
    if (_userResponse.ok) {
      return addUserToTeam(robot, response, teamId, otherUser.id, otherUsername, emailAddress);
    }

    if (_userResponse.statusCode === 404) {
      await robot.client.createUser(otherUser.id, otherUser.name, emailAddress);
      await addUserToTeam(robot, response, teamId, otherUser.id, otherUsername, emailAddress);
    }
  });

};
