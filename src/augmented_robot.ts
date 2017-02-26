import { Robot, Response } from 'hubot'
import { RobotWithClient } from './hackbot'

export interface AugmentedRobot extends RobotWithClient {
  respondAsync(regex: RegExp, options: any, callback: (res: Response) => Promise<void>): void
  respondAsync(regex: RegExp, callback: (res: Response) => Promise<void>): void
}

function respondAsyncWithoutOptions(regex: RegExp, callback: (res: Response) => Promise<void>) {
  const robot: Robot = this

  robot.respond(regex, (res: Response) => {
    callback(res).then(undefined, (err) => robot.emit('error', err, res))
  })
}

function respondAsync(regex: RegExp, options: any, callback: (res: Response) => Promise<void>) {
  const robot: Robot = this

  if (typeof options === 'function') {
    respondAsyncWithoutOptions.call(robot, regex, options)
    return
  }

  robot.respond(regex, options, (res: Response) => {
    callback(res).then(undefined, (err) => robot.emit('error', err, res))
  })
}

export function AugmentRobot(robot: Robot): AugmentedRobot {
  const augmentedRobot: AugmentedRobot = <any> robot
  augmentedRobot.respondAsync = respondAsync.bind(robot)
  return augmentedRobot
}
