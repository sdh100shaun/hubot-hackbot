import { RobotWithClient } from '../hackbot';

export default (robot: RobotWithClient) => {

  robot.respond(/create team (.*)/i, (response) => {
    const userId = response.message.user.id;
    const userName = response.message.user.name;
    const teamName = response.match[1];

    robot.client.getUser(userId)
      .then((res) => {

        const emailAddress = robot.brain.data.users[userId].email_address;

        if (res.statusCode === 404) {
          return robot.client.createUser(userId, userName, emailAddress)
            .then(createUserResponse => {
              if (createUserResponse.ok) {
                return robot.client.createTeam(teamName, userId, emailAddress)
                  .then(createTeamResponse => {
                    if (createTeamResponse.ok) {
                      return response.reply(`Welcome to team ${teamName}!`);
                    }
                    if (createTeamResponse.statusCode === 409) {
                      return response.reply('Sorry, but that team already exists!');
                    }

                    response.reply(`Sorry, I can't create your team :frowning:`);
                  });
              }

              if (createUserResponse.statusCode === 403) {
                return response.reply(`Sorry, you don't have permission to create a team.`);
              }

              response.reply(`Sorry, I can't create your user account :frowning:`);
            });
        }

        if (res.user.team.id !== undefined) {
          return response.reply(`You're already a member of ${res.user.team.name}!`);
        }

        return robot.client.createTeam(teamName, userId, emailAddress)
          .then(createTeamResponse => {
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
      })
      .catch((err) => {
        robot.emit('error', err, response);
        response.reply(`I'm sorry, there appears to be a big problem!`);
      });
  });

};
