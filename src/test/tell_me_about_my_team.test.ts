import { expect } from 'chai';
import * as sinon from 'sinon';
import { RobotWithClient } from '../hackbot';
import * as Helper from 'hubot-test-helper';

describe('@hubot tell me about my team', () => {

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

  describe('when in a team with a motto', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let teamName: string;
    let firstTeamMember: string;
    let secondTeamMember: string;
    let thirdTeamMember: string;
    let motto: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userId = 'jerry';
      teamName = 'Pointy Wizards';
      firstTeamMember = 'Jerry';
      secondTeamMember = 'Bob';
      thirdTeamMember = 'Perry';
      motto = 'Pikes and spikes hurt on bikes';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userId,
          team: {
            id: 'some team id',
            name: teamName,
            motto: motto,
            members: [{
              name: firstTeamMember,
            }, {
              name: secondTeamMember,
            }, {
              name: thirdTeamMember,
            }],
          },
        },
      }));

      return room.user.say(userId, `@hubot tell me about my team`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should tell the user the team information', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot tell me about my team`],
        ['hubot',
          `@${userId} "${teamName}" has 3 members: ${firstTeamMember},` +
          ` ${secondTeamMember}, ${thirdTeamMember}\r\nThey say: ${motto}`,
        ],
      ]);
    });
  });

  describe('when in a team without a motto', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let teamName: string;
    let firstTeamMember: string;
    let secondTeamMember: string;
    let thirdTeamMember: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userId = 'jerry';
      teamName = 'Pointy Wizards';
      firstTeamMember = 'Jerry';
      secondTeamMember = 'Bob';
      thirdTeamMember = 'Perry';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userId,
          team: {
            id: 'johnny-fives',
            name: teamName,
            motto: null,
            members: [{
              name: firstTeamMember,
            }, {
              name: secondTeamMember,
            }, {
              name: thirdTeamMember,
            }],
          },
        },
      }));

      return room.user.say(userId, `@hubot tell me about my team`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should tell the user the team information', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot tell me about my team`],
        ['hubot',
          `@${userId} "${teamName}" has 3 members: ${firstTeamMember}, ${secondTeamMember}, ${thirdTeamMember}\r\n` +
          "They don't yet have a motto!",
        ],
      ]);
    });
  });

  describe('when not in a team', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userId = 'jerry';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userId,
          team: {},
        },
      }));

      return room.user.say(userId, `@hubot tell me about my team`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should tell the user that they are not in a team', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot tell me about my team`],
        ['hubot', `@${userId} You're not in a team! :goberserk:`],
      ]);
    });
  });

  describe('when user is unknown', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userId = 'jerry';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404,
      }));

      return room.user.say(userId, `@hubot tell me about my team`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should tell the user that they are not in a team', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot tell me about my team`],
        ['hubot', `@${userId} You're not in a team! :goberserk:`],
      ]);
    });
  });

  describe('when getUser errors', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let error: Error;
    let emitStub: sinon.SinonStub;

    before(() => {
      userId = 'jerry';
      error = new Error('when getUser errors');

      sinon.stub(robot.client, 'getUser').returns(Promise.reject(error));
      emitStub = sinon.stub(robot, 'emit');

      return room.user.say(userId, `@hubot tell me about my team`);
    });

    it('should emit the error', () => {
      expect(emitStub).to.have.been.calledWith('error', error, sinon.match.object);
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot tell me about my team`],
        ['hubot', `@${userId} I'm sorry, there appears to be a big problem!`],
      ]);
    });
  });
});
