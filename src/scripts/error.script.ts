import { Robot, IEnvelope } from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import Config from '../config';

export default (robot: Robot) => {

  robot.error((err, res) => {
    const slackAdapter = robot.adapter as ISlackAdapter;

    if (slackAdapter.customMessage) {
      const customMessage: ICustomMessageData = {
        channel: Config.error_channel,
        attachments: [{
          fallback: `I've just encountered this error: ${err}`,
          color: '#801515',
          title: `I've just encountered an error`,
          text: `\`\`\`\n${err.stack}\n\`\`\``,
          mrkdwn_in: ['text'],
        }],
      };

      slackAdapter.customMessage(customMessage);
    } else {
      const envelope: IEnvelope = {
        room: Config.error_channel,
      };
      robot.adapter.send(envelope, `I've just encountered this error: ${err}`);
    }

    if (res) {
      res.reply('Uhh, sorry, I just experienced an error :goberserk:');
    }
  });
};
