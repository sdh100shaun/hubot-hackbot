import { RobotWithClient } from '../hackbot';
import { UserData } from 'hubot';

export default (robot: RobotWithClient) => {

  robot.respond(/tell me about @([a-z0-9.\-_]+)/i, response => {
    const username = response.match[1];

    let user: UserData = null;
    const users = robot.brain.data.users;
    for (let _userId in robot.brain.data.users) {
      if (robot.brain.data.users.hasOwnProperty(_userId)) {
        const _user = users[_userId];
        if (_user.name === username) {
          user = _user;
          break;
        }
      }
    }

    if (user === null) {
      response.reply(`"${username}" is not a user I recognise!`);
      return;
    }

    robot.client.getUser(user.id)
      .then(res => {
        if (!res.ok && res.statusCode === 404) {
          return response.reply(`"${user.name}" is not a user I recognise!`);
        }

        if (!('name' in res.user.team)) {
          return response.reply(`"${user.name}" is not yet a member of a team!`);
        }

        const teamResponse = `"${user.name}" is a member of team: ${res.user.team.name}`;

        const mottoResponse = res.user.team.motto === null
          ? `They don't yet have a motto!`
          : `They say: ${res.user.team.motto}`;

        response.reply(`${teamResponse},\r\n${mottoResponse}`);
      })
      .catch(err => {
        robot.emit('error', err, response);
        response.reply(`I'm sorry, there appears to be a big problem!`);
      });
  });

};
