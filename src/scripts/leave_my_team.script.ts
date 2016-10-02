import { RobotWithClient } from '../hackbot';

export default (robot: RobotWithClient) => {

  robot.respond(/leave my team/i, response => {
    const user = robot.adapter.client.rtm.dataStore.getUserById(response.message.user.id);

    robot.client.getUser(user.id)
      .then(res => {
        if (!res.ok || res.user.team.id === undefined) {
          return response.reply(`You're not in a team! :goberserk:`);
        }

        const emailAddress = user.profile.email;

        return robot.client.removeTeamMember(res.user.team.id, user.id, emailAddress)
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
        robot.emit('error', err, response);
        response.reply(`I'm sorry, there appears to be a big problem!`);
      });
  });

};
