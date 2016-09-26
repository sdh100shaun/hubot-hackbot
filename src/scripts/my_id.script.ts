import { Robot } from 'hubot';

export default (robot: Robot) => {

  robot.respond(/my id/i, (response) => {
    for (let x in response.message.user) {
      if (response.message.user.hasOwnProperty(x)) {
        robot.send(response.message.user, `${x}: `);
      }
    }
  });

};
