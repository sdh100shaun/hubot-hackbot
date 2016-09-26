import { Robot } from 'hubot';

export default (robot: Robot) => {

  robot.respond(/my id/i, (response) => {
    const user: { [key: string]: string } = <any> response.message.user;
    const msg = Object.keys(user).reduce((agg, key) => agg += `\r\n${key}: ${user[key]}`, 'This is you:');
    robot.send({ room: response.message.user.name }, msg);
  });

};
