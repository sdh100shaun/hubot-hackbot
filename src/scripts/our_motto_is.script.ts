import { RobotWithClient } from '../hackbot';

export default (robot: RobotWithClient) => {

  robot.respond(/our motto is (.*)/i, response => {
    const userId = response.message.user.id;
    const userName = response.message.user.name;
    const motto = response.match[1];

    robot.client.getUser(userId)
      .then(res => {

        if ((!res.ok && res.statusCode === 404) || res.user.team.id === undefined)
          return response.reply(`You're not in a team! :goberserk:`);

        const email_address = robot.brain.data.users[userId].email_address

        robot.client.updateMotto(motto, res.user.team.id, email_address)
          .then(updateMottoResponse => {
            if (updateMottoResponse.ok)
              return response.reply(`So it is! As ${res.user.team.name} say: ${motto}`);

            if (updateMottoResponse.statusCode === 403)
              return response.reply('Sorry, only team members can change the motto.');

            response.reply(`Sorry, I tried, but something went wrong.`);
          });
      })
      .catch(err => {
        console.log(`ERROR: ` + err);
        response.reply(`I'm sorry, there appears to be a big problem!`);
      });
  });

};
