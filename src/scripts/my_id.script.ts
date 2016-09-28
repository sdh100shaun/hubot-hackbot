import { Robot } from 'hubot-slack';
import { MemoryDataStore } from '@slack/client';

export default (robot: Robot) => {

  robot.respond(/my id/i, (response) => {
    const userId = response.envelope.user.id;
    const dataStore = robot.adapter.client.rtm.dataStore;
    const user = dataStore.getUserById(userId);

    if (user) {
      const msg = JSON.stringify(user, null, 2);
      robot.send({ id: response.envelope.user.id }, {
        attachments: [{
          fallback: `\`\`\`${msg}\`\`\``,
          color: 'good',
          text: `\`\`\`${msg}\`\`\``,
          mrkdwn_in: ['text'],
        }],
      });
    } else {
      robot.send({ id: response.envelope.user.id }, `Could not find that user`);
    }
  });

  robot.respond(/whois (.+)/i, (response) => {
    const userName = response.match[1];
    const adapter: any = robot.adapter;
    const dataStore: MemoryDataStore = adapter.client.rtm.dataStore;

    const user = dataStore.getUserByName(userName);

    if (user) {
      const msg = JSON.stringify(user, null, 2);
      robot.send({ id: response.envelope.user.id }, {
        attachments: [{
          fallback: `\`\`\`${msg}\`\`\``,
          color: 'good',
          text: `\`\`\`${msg}\`\`\``,
          mrkdwn_in: ['text'],
        }],
      });
    } else {
      robot.send({ id: response.envelope.user.id }, `Could not find that user`);
    }
  });

};
