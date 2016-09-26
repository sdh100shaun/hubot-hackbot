import { Robot } from 'hubot';

export default (robot: Robot) => {

  robot.respond(/my id/i, (response) => {
    response.reply(`Your id is ${response.message.user.id}`);
  });

};
