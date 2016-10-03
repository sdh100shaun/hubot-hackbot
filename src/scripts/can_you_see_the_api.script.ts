import { AugmentedRobot } from '../async';

export default (robot: AugmentedRobot) => {
  robot.respondAsync(/can you see the api\??/i, async (response) => {
    response.reply(`I'll have a quick look for you...`);

    const res = await robot.client.checkApi();

    if (res.ok) {
      return response.reply('I see her!');
    }
    response.reply(`I'm sorry, there appears to be a problem; something about "${res.statusCode}"`);
  });
};
