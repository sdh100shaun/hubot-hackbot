import { RobotWithClient } from '../hackbot';

export default (robot: RobotWithClient) => {

  robot.respond(/leave my team/i, response => {
    const userId = response.message.user.id;

    robot.client.getUser(userId)
      .then(res => {
        if (!res.ok || res.user.team.id === undefined) {
          return response.reply(`You're not in a team! :goberserk:`);
        }

        const emailAddress = robot.brain.data.users[userId].email_address;

        return robot.client.removeTeamMember(res.user.team.id, userId, emailAddress)
          .then(removeTeamMemberResponse => {
            if (removeTeamMemberResponse.ok) {
              return response.reply(`OK, you've been removed from team "${res.user.team.name}"`);
            }
            if (removeTeamMemberResponse.statusCode === 403) {
              return response.reply(`Sorry, you don't have permission to leave your team.`);
            }

            response.reply(`Sorry, I tried, but something went wrong.`);
          });
      })
      .catch(err => {
        response.reply(`I'm sorry, there appears to be a big problem!`);
      });
  });

};
