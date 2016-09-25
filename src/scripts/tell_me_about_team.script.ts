import { RobotWithClient } from '../hackbot';
import * as slug from 'slug';

export default (robot: RobotWithClient) => {

  robot.respond(/tell me about team (.*)/i, (response) => {
    const teamId = slug(response.match[1], { lower: true });

    robot.client.getTeam(teamId)
      .then(res => {
        if (res.statusCode === 404) return response.reply(`Sorry, I can't find that team.`);
        if (!res.ok) return response.reply('Sorry, there was a problem when I tried to look up that team :frowning:');

        if (res.team.members.length === 0) return response.reply(`"${res.team.name}" is an empty team.`);

        if (res.team.members.length === 1 && res.team.members[0].id === response.message.user.id) {
          const motto = res.team.motto === null ? `and you have not yet set your motto!` : `and your motto is: ${res.team.motto}`;
          return response.reply(`You are the only member of "${res.team.name}" ${motto}`);
        }

        const memberList = res.team.members.map(member => member.name);
        const noun = res.team.members.length === 1 ? 'member' : 'members';
        const motto = res.team.motto === null ? `They don't yet have a motto!` : `They say: ${res.team.motto}`;

        response.reply(`"${res.team.name}" has ${res.team.members.length} ${noun}: ${memberList.join(', ')}\r\n${motto}`);
      })
      .catch(err => {
        console.log(`ERROR: ` + err);
        response.reply(`I'm sorry, there appears to be a big problem!`);
      });
  });

};
