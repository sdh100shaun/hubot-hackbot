import { expect } from 'chai';
import * as sinon from 'sinon';
import { RobotWithClient } from '../hackbot';
import { UserData } from 'hubot';
import * as Helper from 'hubot-test-helper';

describe('@hubot our motto is', () => {

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

  describe('when user in a team', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let teamId: string;
    let teamName: string;
    let motto: string;
    let getUserStub: sinon.SinonStub;
    let updateMottoStub: sinon.SinonStub;

    before(() => {
      userId = 'jerry';
      userEmail = 'jerry@jerry.jerry';
      teamId = 'my-crazy-team-name';
      teamName = 'My Crazy Team Name';
      motto = 'We are great';

      robot.brain.data.users[userId] = <UserData> { email_address: userEmail };

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userId,
          team: {
            id: teamId,
            name: teamName,
          },
        },
      }));

      updateMottoStub = sinon.stub(robot.client, 'updateMotto').returns(Promise.resolve({ ok: true }));

      return room.user.say(userId, `@hubot our motto is ${motto}`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should update the team motto', () => {
      expect(updateMottoStub).to.have.been.calledWith(motto, teamId, userEmail);
    });

    it('should tell the user the new motto', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot our motto is ${motto}`],
        ['hubot', `@${userId} So it is! As ${teamName} say: ${motto}`],
      ]);
    });
  });

  describe('when team exists without permission', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let motto: string;
    let getUserStub: sinon.SinonStub;
    let updateMottoStub: sinon.SinonStub;

    before(() => {
      userId = 'jerry';
      motto = 'We are great';

      robot.brain.data.users[userId] = <UserData> { email_address: 'jerry@jerry.jerry' };

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userId,
          team: { id: 'my-crazy-team-name' },
        },
      }));

      updateMottoStub = sinon.stub(robot.client, 'updateMotto').returns(Promise.resolve({
        ok: false,
        statusCode: 403,
      }));

      return room.user.say(userId, `@hubot our motto is ${motto}`);
    });

    it('should tell the user they do not have permission', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot our motto is ${motto}`],
        ['hubot', `@${userId} Sorry, only team members can change the motto.`],
      ]);
    });
  });

  describe('when user not in a team', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userId = 'jerry';

      robot.brain.data.users[userId] = <UserData> { email_address: 'jerry@jerry.jerry' };

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userId,
          team: {},
        },
      }));

      return room.user.say(userId, '@hubot our motto is We are great');
    });

    it('should tell the user the motto is changed', () => {
      expect(room.messages).to.eql([
        [userId, '@hubot our motto is We are great'],
        ['hubot', `@${userId} You're not in a team! :goberserk:`],
      ]);
    });
  });

  describe('when user unknown', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userId = 'jerry';

      robot.brain.data.users[userId] = <UserData> { email_address: 'jerry@jerry.jerry' };

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404,
      }));

      return room.user.say(userId, '@hubot our motto is We are great');
    });

    it('should tell the user the motto is changed', () => {
      expect(room.messages).to.eql([
        [userId, '@hubot our motto is We are great'],
        ['hubot', `@${userId} You're not in a team! :goberserk:`],
      ]);
    });
  });
});
