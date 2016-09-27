import { Robot, IEnvelope } from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import Config from '../config';

export default (robot: Robot) => {

  robot.error((err, res) => {
    const slackAdapter = robot.adapter as ISlackAdapter;
    const msg = `I've just encountered this error: ${err}`;

    if (slackAdapter.customMessage) {
      const customMessage: ICustomMessageData = {
        channel: Config.error_channel,
        attachments: [{
          fallback: msg,
          color: '#801515',
          title: `I've just encountered an error`,
          text: `\`\`\`\n${err.stack}\n\`\`\``,
          mrkdwn_in: ['text'],
        }],
      };

      robot.logger.info(`Posting custom message`, customMessage);
      slackAdapter.customMessage(customMessage);
    } else {
      const envelope: IEnvelope = {
        room: Config.error_channel,
      };
      robot.logger.info(`Posting standard message to ${Config.error_channel}`, msg);
      robot.adapter.send(envelope, msg);
    }

    if (res) {
      res.reply('Uhh, sorry, I just experienced an error :goberserk:');
    }
  });
};
