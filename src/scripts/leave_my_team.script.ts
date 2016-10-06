import { AugmentedRobot } from '../augmented_robot';

export default (robot: AugmentedRobot) => {

  robot.respondAsync(/leave my team/i, async (response) => {
    const user = robot.adapter.client.rtm.dataStore.getUserById(response.message.user.id);

    const res = await robot.client.getUser(user.id);
    if (!res.ok || res.user.team.id === undefined) {
      return response.reply(`You're not in a team! :goberserk:`);
    }

    const emailAddress = user.profile.email;

    const removeTeamMemberResponse = await robot.client.removeTeamMember(res.user.team.id, user.id, emailAddress);
    if (removeTeamMemberResponse.ok) {
      return response.reply(`OK, you've been removed from team "${res.user.team.name}"`);
    }
    if (removeTeamMemberResponse.statusCode === 403) {
      return response.reply(`Sorry, you don't have permission to leave your team.`);
    }

    response.reply(`Sorry, I tried, but something went wrong.`);
  });

};
