import { expect } from 'chai';
import * as sinon from 'sinon';
import { RobotWithClient } from '../hackbot';
import { UserData } from 'hubot';
import * as Helper from 'hubot-test-helper';

describe('@hubot tell me about @username', () => {

  let helper: Helper.Helper;
  let room: Helper.Room;
  let robot: RobotWithClient;

  before(() => helper = new Helper('../index.js'));

  function setUp() {
    room = helper.createRoom();
    robot = <RobotWithClient> room.robot;
  }

  function tearDown() {
    room.destroy();
  }

  describe('when user exists with team and a motto', () => {

    before(setUp);
    after(tearDown);

    let myUsername: string;
    let userId: string;
    let username: string;
    let teamName: string;
    let motto: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      myUsername = 'benny';
      userId = 'pig';
      username = 'PigBodine';
      teamName = 'Whole Sick Crew';
      motto = 'A-and...';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userId,
          team: {
            id: 'some random id',
            name: teamName,
            motto: motto,
            members: [],
          },
        },
      }));

      robot.brain.data.users[userId] = <UserData> {
        id: userId,
        name: username,
      };

      return room.user.say(myUsername, `@hubot tell me about @${username}`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should tell the user the user information', () => {
      expect(room.messages).to.eql([
        [myUsername, `@hubot tell me about @${username}`],
        ['hubot',
         `@${myUsername} "${username}" is a member of team: ${teamName},\r\n` +
         `They say: ${motto}`,
        ],
      ]);
    });
  });

  describe('when user exists with team but no motto', () => {

    before(setUp);
    after(tearDown);

    let myUsername: string;
    let userId: string;
    let username: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      myUsername = 'benny';
      userId = 'pig';
      username = 'PigBodine';
      teamName = 'Whole Sick Crew';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userId,
          team: {
            id: 'some random id',
            name: teamName,
            motto: null,
            members: [],
          },
        },
      }));

      robot.brain.data.users[userId] = <UserData> {
        id: userId,
        name: username,
      };

      return room.user.say(myUsername, `@hubot tell me about @${username}`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should tell the user the user information', () => {
      expect(room.messages).to.eql([
        [myUsername, `@hubot tell me about @${username}`],
        ['hubot',
         `@${myUsername} "${username}" is a member of team: ${teamName},\r\n` +
         `They don't yet have a motto!`,
        ],
      ]);
    });
  });

  describe('when user exists with no team', () => {

    before(setUp);
    after(tearDown);

    let myUsername: string;
    let userId: string;
    let username: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      myUsername = 'benny';
      userId = 'pig';
      username = 'PigBodine';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userId,
          team: {},
        },
      }));

      robot.brain.data.users[userId] = <UserData> {
        id: userId,
        name: username,
      };

      return room.user.say(myUsername, `@hubot tell me about @${username}`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should tell the user the user information', () => {
      expect(room.messages).to.eql([
        [myUsername, `@hubot tell me about @${username}`],
        ['hubot',
         `@${myUsername} "${username}" is not yet a member of a team!`,
        ],
      ]);
    });
  });

  describe('when user is unknown by the API', () => {

    before(setUp);
    after(tearDown);

    let myUsername: string;
    let userId: string;
    let username: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      myUsername = 'benny';
      userId = 'pig';
      username = 'PigBodine';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404,
      }));

      robot.brain.data.users[userId] = <UserData> {
        id: userId,
        name: username,
      };

      return room.user.say(myUsername, `@hubot tell me about @${username}`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should tell the user that no such user exists', () => {
      expect(room.messages).to.eql([
        [myUsername, `@hubot tell me about @${username}`],
        ['hubot',
         `@${myUsername} "${username}" is not a user I recognise!`,
        ],
      ]);
    });
  });

  describe('when user is unknown by the brain', () => {

    before(setUp);
    after(tearDown);

    let myUsername: string;
    let username: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      myUsername = 'benny';
      username = 'PigBodine';

      getUserStub = sinon.stub(robot.client, 'getUser');

      return room.user.say(myUsername, `@hubot tell me about @${username}`);
    });

    it('should not fetch the user', () => {
      expect(getUserStub).to.not.have.been.calledWith();
    });

    it('should tell the user that no such user exists', () => {
      expect(room.messages).to.eql([
        [myUsername, `@hubot tell me about @${username}`],
        ['hubot',
         `@${myUsername} "${username}" is not a user I recognise!`,
        ],
      ]);
    });
  });

  describe('when getUser errors', () => {

    before(setUp);
    after(tearDown);

    let myUsername: string;
    let userId: string;
    let username: string;
    let error: Error;
    let emitStub: sinon.SinonStub;

    before(() => {
      myUsername = 'benny';
      userId = 'pig';
      username = 'PigBodine';
      error = new Error('problem happened');

      sinon.stub(robot.client, 'getUser').returns(Promise.reject(error));
      emitStub = sinon.stub(robot, 'emit');

      robot.brain.data.users[userId] = <UserData> {
        id: userId,
        name: username,
      };

      return room.user.say(myUsername, `@hubot tell me about @${username}`);
    });

    it('should emit the error', () => {
      expect(emitStub).to.have.been.calledWith('error', error, sinon.match.object);
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [myUsername, `@hubot tell me about @${username}`],
        ['hubot', `@${myUsername} I'm sorry, there appears to be a big problem!`],
      ]);
    });
  });

});
