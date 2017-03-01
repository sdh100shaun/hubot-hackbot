import { AugmentedRobot } from '../augmented_robot'

export default (robot: AugmentedRobot) => {

  robot.respondAsync(/find teams like (.*)/i, async (response) => {
    const nameFilter = response.match[1]

    const res = await robot.client.findTeams(nameFilter)
    if (res.teams.length === 0) {
      return response.reply('None found.')
    }

    const names = res.teams.slice(0, 3).map((team) => team.name)
    response.reply(`Found ${res.teams.length} teams; here's a few: ${names.join(', ')}`)
  })

}
