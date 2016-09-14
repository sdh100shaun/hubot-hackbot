declare module 'hubot-test-helper' {
  import { Robot } from 'hubot';

  class Helper {
    constructor(scriptsPaths: string);
    createRoom(options?: Helper.CreateRoomOptions): Helper.Room;
  }

  namespace Helper {
    interface CreateRoomOptions { }

    interface User {
      say(userName: string, message: string): Promise<void>;
      enter(userName: string): Promise<void>;
      leave(userName: string): Promise<void>;
    }

    class Room {
      destroy(): void;
      user: User;
      messages: [string, string][];
      robot: Robot;
    }
  }

  export = Helper;
}