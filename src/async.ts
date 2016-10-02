import { Robot, Response } from 'hubot';
import { RobotWithClient } from './hackbot';

export interface AsyncRobot extends RobotWithClient {
  respondAsync(regex: RegExp, options: any, callback: (res: Response) => PromiseLike<void>): void;
  respondAsync(regex: RegExp, callback: (res: Response) => PromiseLike<void>): void;
}

function respondAsync(regex: RegExp, options: any, callback: (res: Response) => PromiseLike<void>) {
  const robot: Robot = this;
  const cb: (res: Response) => PromiseLike<void> = (typeof callback === "Function" || options);
  robot.respond(regex, options, (res: Response) => {
    cb(res).then(() => void 0, (err) => robot.emit('error', err, res));
  });
}

export function AugmentRobot(robot: Robot) {
  const asyncRobot: AsyncRobot = <any> robot;
  asyncRobot.respondAsync = respondAsync.bind(robot);
  return asyncRobot;
}
