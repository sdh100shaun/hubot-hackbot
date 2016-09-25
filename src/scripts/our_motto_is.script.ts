import { RobotWithClient } from '../hackbot';

export default (robot: RobotWithClient) => {

  robot.respond(/our motto is (.*)/i, response => {
    const userId = response.message.user.id;
    const motto = response.match[1];

    robot.client.getUser(userId)
      .then(getUserResponse => {

        if ((!getUserResponse.ok && getUserResponse.statusCode === 404) || getUserResponse.user.team.id === undefined) {
          return response.reply(`You're not in a team! :goberserk:`);
        }

        const emailAddress = robot.brain.data.users[userId].email_address;

        robot.client.updateMotto(motto, getUserResponse.user.team.id, emailAddress)
          .then(updateMottoResponse => {
            if (updateMottoResponse.ok) {
              return response.reply(`So it is! As ${getUserResponse.user.team.name} say: ${motto}`);
            }

            if (updateMottoResponse.statusCode === 403) {
              return response.reply('Sorry, only team members can change the motto.');
            }

            response.reply(`Sorry, I tried, but something went wrong.`);
          });
      })
      .catch(err => {
        response.reply(`I'm sorry, there appears to be a big problem!`);
      });
  });

};
