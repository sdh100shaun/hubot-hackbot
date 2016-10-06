declare module 'hubot-test-helper' {
  import { Robot, User as HubotUser, Message, Adapter } from 'hubot';

  var hth: hth.Helper;

  namespace hth {
    interface CreateRoomOptions { }

    interface User extends HubotUser {
      say(userName: string, message: Message): Promise<void>;
      say(userName: string, message: string): Promise<void>;
      enter(userName: string): Promise<void>;
      leave(userName: string): Promise<void>;
    }

    interface Helper {
      new (scriptsPaths: string | string[]): Helper;
      createRoom(options?: CreateRoomOptions): Room;
    }

    interface Room extends Adapter {
      user: User;
      messages: [string, string][];
      robot: Robot;

      receive(userName: string, message: string): Promise<void>;
      destroy(): void;
    }
  }

  export = hth;
}
