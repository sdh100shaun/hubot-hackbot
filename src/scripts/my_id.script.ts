import { Robot } from 'hubot';

export default (robot: Robot) => {

  robot.respond(/my id/i, (response) => {
    const user: { [key: string]: any } = <any> response.message.user;
    let msg = Object.keys(user).reduce((agg, key) => agg += `\r\n${key}: ${user[key]}`, 'This is you:');
    msg = Object.keys(user['_properties']).reduce((agg, key) => agg += `\r\n_properties.${key}: ${user['_properties'][key]}`, msg);
    msg = Object.keys(user['profile']).reduce((agg, key) => agg += `\r\nprofile.${key}: ${user['profile'][key]}`, msg);
    robot.send(response.message.user, msg);
  });

  robot.respond(/thing/i, (response) => {
    robot.send({ room: '#hackbot-errors' }, <any> {
      text: 'Testing',
      attachments: [{
        text: 'I am an attachment',
      }],
    });
  });

};
