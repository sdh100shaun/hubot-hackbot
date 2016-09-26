import { RobotWithClient } from '../hackbot';

export default (robot: RobotWithClient) => {
  robot.respond(/can you see the api\??/i, (response) => {
    response.reply(`I'll have a quick look for you...`);

    robot.client
      .checkApi()
      .then((res) => {
        if (res.ok) {
          return response.reply('I see her!');
        }
        response.reply(`I'm sorry, there appears to be a problem; something about "${res.statusCode}"`);
      })
      .catch((err) => {
        console.error(`API check failed: ${err.message}`);
        response.reply(`I'm sorry, there appears to be a big problem!`);
      });
  });
};
