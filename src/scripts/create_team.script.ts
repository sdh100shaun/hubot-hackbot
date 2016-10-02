import { AsyncRobot } from '../async';

export default (robot: AsyncRobot) => {

  robot.respond(/create team (.*)/i, async (response) => {
    const user = robot.adapter.client.rtm.dataStore.getUserById(response.message.user.id);
    const userName = response.message.user.name;
    const teamName = response.match[1];

    const res = await robot.client.getUser(user.id);

    const emailAddress = user.profile.email;

    if (res.statusCode === 404) {
      const createUserResponse = await robot.client.createUser(user.id, userName, emailAddress);

      if (createUserResponse.ok) {
        const createTeamResponse = await robot.client.createTeam(teamName, user.id, emailAddress);

        if (createTeamResponse.ok) {
          return response.reply(`Welcome to team ${teamName}!`);
        }

        if (createTeamResponse.statusCode === 409) {
          return response.reply('Sorry, but that team already exists!');
        }

        return response.reply(`Sorry, I can't create your team :frowning:`);
      }

      if (createUserResponse.statusCode === 403) {
        return response.reply(`Sorry, you don't have permission to create a team.`);
      }

      return response.reply(`Sorry, I can't create your user account :frowning:`);
    }

    if (res.user.team.id !== undefined) {
      return response.reply(`You're already a member of ${res.user.team.name}!`);
    }

    const createTeamResponse = await robot.client.createTeam(teamName, user.id, emailAddress);
    if (createTeamResponse.ok) {
      return response.reply(`Welcome to team ${teamName}!`);
    }
    if (createTeamResponse.statusCode === 403) {
      return response.reply(`Sorry, you don't have permission to create a team.`);
    }
    if (createTeamResponse.statusCode === 409) {
      return response.reply('Sorry, but that team already exists!');
    }

    response.reply(`Sorry, I can't create your team :frowning:`);
  });

};
