import { Robot } from 'hubot';

export default (robot: Robot) => {

  robot.respond(/my id/i, (response) => {
    const user: { [key: string]: string } = <any> response.message.user;

    for (let x in user) {
      if (user.hasOwnProperty(x)) {
        robot.send(user, `${x}: ${user[x]}`);
      }
    }
  });

};
