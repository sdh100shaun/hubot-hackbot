import { RobotWithClient } from '../hackbot';

export default (robot: RobotWithClient) => {

  robot.respond(/find teams like (.*)/i, response => {
    const nameFilter = response.match[1];

    robot.client.findTeams(nameFilter)
      .then(res => {
        if (res.teams.length === 0) {
          return response.reply('None found.');
        }

        const names = res.teams.slice(0, 3).map(team => team.name);
        response.reply(`Found ${res.teams.length} teams; here's a few: ${names.join(', ')}`);
      })
      .catch(err => {
        response.reply(`I'm sorry, there appears to be a big problem!`);
      });
  });

};
