import { RobotWithClient } from '../hackbot';

export default (robot: RobotWithClient) => {

  robot.respond(/create team (.*)/i, (response) => {
    const userId = response.message.user.id
    const userName = response.message.user.name
    const teamName = response.match[1]

    robot.client.getUser(userId)
      .then((res) => {

        const email_address = robot.brain.data.users[userId].email_address

        if (res.statusCode === 404) {
          return robot.client.createUser(userId, userName, email_address)
            .then((res) => {
              if (res.ok)
                return robot.client.createTeam(teamName, userId, email_address)
                  .then((res) => {
                    if (res.ok) return response.reply(`Welcome to team ${teamName}!`);
                    if (res.statusCode === 409) return response.reply('Sorry, but that team already exists!');

                    response.reply(`Sorry, I can't create your team :frowning:`);
                  });

              if (res.statusCode === 403) return response.reply(`Sorry, you don't have permission to create a team.`);

              response.reply(`Sorry, I can't create your user account :frowning:`);
            });
        }

        if (res.user.team.id !== undefined) {
          return response.reply(`You're already a member of ${res.user.team.name}!`);
        }

        robot.client.createTeam(teamName, userId, email_address)
          .then((res) => {
            if (res.ok) return response.reply(`Welcome to team ${teamName}!`);
            if (res.statusCode === 403) return response.reply(`Sorry, you don't have permission to create a team.`);
            if (res.statusCode === 409) return response.reply('Sorry, but that team already exists!');

            response.reply(`Sorry, I can't create your team :frowning:`);
          });
      })
      .catch((err) => {
        response.reply(`I'm sorry, there appears to be a big problem!`);
      });
  });

};
