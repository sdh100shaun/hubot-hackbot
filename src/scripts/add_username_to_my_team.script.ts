import { UserData } from 'hubot';
import { RobotWithClient } from '../hackbot';

export default (robot: RobotWithClient) => {

  robot.respond(/add @([a-z0-9.\-_]+)\s+to my team/, response => {
    const otherUsername = response.match[1]
    const userId = response.message.user.id

    robot.client.getUser(userId)
      .then(res => {
        if (res.user.team.id === undefined)
          return response.reply(`I would, but you're not in a team...`);

        const teamId = res.user.team.id;

        let otherUser: UserData;
        const users = robot.brain.data.users;
        for (let userId in robot.brain.data.users) {
          const user = users[userId];
          if (user.name === otherUsername) {
            otherUser = user;
            break;
          }
        }

        function addUserToTeam(teamId: string, otherUserId: string, emailAddress: string) {
          robot.client.addUserToTeam(teamId, otherUserId, emailAddress)
            .then(res => {
              if (res.statusCode === 400)
                return response.reply(`Sorry, ${otherUsername} is already in another team and must leave that team first.`);

              if (res.statusCode === 403)
                return response.reply(`Sorry, you don't have permission to add people to your team.`);

              response.reply('Done!');
            });
        }

        const emailAddress = robot.brain.data.users[userId].email_address

        return robot.client.getUser(otherUser.id)
          .then(res => {
            if (res.ok) return addUserToTeam(teamId, otherUser.id, emailAddress);

            if (res.statusCode === 404)
              robot.client.createUser(otherUser.id, otherUser.name, emailAddress)
                .then(res => addUserToTeam(teamId, otherUser.id, emailAddress));
          });
      });
  });

};
