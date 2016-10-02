import { AsyncRobot } from '../async';

export default (robot: AsyncRobot) => {

  robot.respondAsync(/tell me about @([a-z0-9.\-_]+)/i, async (response) => {
    const username = response.match[1];

    const dataStore = robot.adapter.client.rtm.dataStore;
    const user = dataStore.getUserByName(username);

    if (user === undefined) {
      response.reply(`"${username}" is not a user I recognise!`);
      return;
    }

    const res = await robot.client.getUser(user.id);
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
  });

};
