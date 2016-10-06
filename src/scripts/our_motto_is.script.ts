import { AugmentedRobot } from '../augmented_robot';

export default (robot: AugmentedRobot) => {

  robot.respondAsync(/our motto is (.*)/i, async (response) => {
    const user = robot.adapter.client.rtm.dataStore.getUserById(response.message.user.id);
    const motto = response.match[1];

    const getUserResponse = await robot.client.getUser(user.id);

    if ((!getUserResponse.ok && getUserResponse.statusCode === 404) || getUserResponse.user.team.id === undefined) {
      return response.reply(`You're not in a team! :goberserk:`);
    }

    const emailAddress = user.profile.email;

    const updateMottoResponse = await robot.client.updateMotto(motto, getUserResponse.user.team.id, emailAddress);
    if (updateMottoResponse.ok) {
      return response.reply(`So it is! As ${getUserResponse.user.team.name} say: ${motto}`);
    }

    if (updateMottoResponse.statusCode === 403) {
      return response.reply('Sorry, only team members can change the motto.');
    }

    response.reply(`Sorry, I tried, but something went wrong.`);
  });

};
