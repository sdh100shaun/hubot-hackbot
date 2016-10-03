import { AugmentedRobot } from '../async';

export default (robot: AugmentedRobot) => {

  robot.respondAsync(/tell me about my team/i, async (response) => {
    const userId = response.message.user.id;

    const res = await robot.client.getUser(userId);
    if ((!res.ok && res.statusCode === 404) || res.user.team.id === undefined) {
      return response.reply(`You're not in a team! :goberserk:`);
    }

    const memberList = res.user.team.members.map((member) => member.name);
    const noun = res.user.team.members.length === 1 ? 'member' : 'members';
    const motto = res.user.team.motto === null ? `They don't yet have a motto!` : `They say: ${res.user.team.motto}`;

    response.reply(`"${res.user.team.name}" has ${res.user.team.members.length} ${noun}: ${memberList.join(', ')}\r\n${motto}`);
  });

};
