import { Robot } from 'hubot-slack';
import Config from '../config';

export default (robot: Robot) => {

  robot.error((err, response) => {
    let fallback = `Error: ${err.message}`;
    let text = `\`\`\`
Error: ${err.stack}
\`\`\``;

    if (response) {
      response.reply('Uhh, sorry, I just experienced an error :goberserk:');

      const user = response.envelope.user;
      fallback = `Error responding to message from @${user.name}
Command: ${response.message.text}
${fallback}`;
      text = `Error responding to message from @${user.name}
\`\`\`
Command: ${response.message.text}
\`\`\`
${text}`;
  }

    robot.send({ room: Config.HACKBOT_ERROR_CHANNEL.value }, {
      attachments: [{
        fallback: fallback,
        color: 'warning',
        title: `Hackbot error caught`,
        text: text,
        mrkdwn_in: ['text'],
      }],
    });
  });
};
