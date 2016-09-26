import { Robot } from 'hubot';

export default (robot: Robot) => {

  robot.respond(/what are your prime directives\??/i, (response) => {
    response.reply(`1. Serve the public trust
2. Protect the innocent hackers
3. Uphold the Code of Conduct\n4. [Classified]`);
  });

};
