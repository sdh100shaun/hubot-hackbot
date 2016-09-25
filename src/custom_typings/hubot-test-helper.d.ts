declare module 'hubot-test-helper' {
  import { Robot } from 'hubot';

  var hth: hth.Helper;

  namespace hth {
    interface CreateRoomOptions { }

    interface User {
      say(userName: string, message: string): Promise<void>;
      enter(userName: string): Promise<void>;
      leave(userName: string): Promise<void>;
    }

    interface Helper {
      new (scriptsPaths: string): Helper;
      createRoom(options?: CreateRoomOptions): Room;
    }

    interface Room {
      destroy(): void;
      user: User;
      messages: [string, string][];
      robot: Robot;
    }
  }

  export = hth;
}
