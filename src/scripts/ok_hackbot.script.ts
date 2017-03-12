import { AugmentedRobot } from '../augmented_robot'

function getEpoch() {
  return new Date().getTime() / 1000
}

export default (robot: AugmentedRobot) => {

  robot.hear(/^OK (.+)$/i, async (response) => {
    const match = response.match[1]

    if (match !== robot.name) {
      return
    }

    robot.brain.set(`ok_${response.message.user.id}`, getEpoch())
    response.reply(`Yes?`)
  })

  robot.catchAll((response) => {
    const userId = response.message.user.id
    const when = robot.brain.get(`ok_${userId}`)

    if (!when) {
      return
    }

    robot.brain.remove(`ok_${userId}`)

    const cutOff = getEpoch() - 30
    const diff = when - cutOff

    if (diff >= 0) {
      const message = response.message
      message.text = `${robot.name} ${response.message.text}`

      robot.receive(message, () => {
        robot.brain.set(`ok_${response.message.user.id}`, getEpoch())
      })
    }
  })

}
