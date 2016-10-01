import { expect } from 'chai';
import * as sinon from 'sinon';
import { RobotWithClient } from '../hackbot';
import { MemoryDataStore, User } from '@slack/client';
import * as Helper from 'hubot-test-helper';

describe('@hubot our motto is', () => {

  let helper: Helper.Helper;
  let room: Helper.Room;
  let robot: RobotWithClient;
  let dataStore: MemoryDataStore;

  before(() => helper = new Helper('../index.js'));

  function setUp() {
    room = helper.createRoom();
    robot = <RobotWithClient> room.robot;
    dataStore = new MemoryDataStore();
    robot.adapter.client = { rtm: { dataStore: dataStore } };
  }

  function tearDown() {
    room.destroy();
  }

  describe('when user in a team', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let userEmail: string;
    let teamId: string;
    let teamName: string;
    let motto: string;
    let getUserStub: sinon.SinonStub;
    let updateMottoStub: sinon.SinonStub;

    before(() => {
      userName = 'jerry';
      userEmail = 'jerry@jerry.jerry';
      teamId = 'my-crazy-team-name';
      teamName = 'My Crazy Team Name';
      motto = 'We are great';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userName,
          team: {
            id: teamId,
            name: teamName,
          },
        },
      }));

      updateMottoStub = sinon.stub(robot.client, 'updateMotto').returns(Promise.resolve({ ok: true }));

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: userEmail } } as User);

      return room.user.say(userName, `@hubot our motto is ${motto}`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userName);
    });

    it('should update the team motto', () => {
      expect(updateMottoStub).to.have.been.calledWith(motto, teamId, userEmail);
    });

    it('should tell the user the new motto', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot our motto is ${motto}`],
        ['hubot', `@${userName} So it is! As ${teamName} say: ${motto}`],
      ]);
    });
  });

  describe('when team exists without permission', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let motto: string;
    let getUserStub: sinon.SinonStub;
    let updateMottoStub: sinon.SinonStub;

    before(() => {
      userName = 'jerry';
      motto = 'We are great';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userName,
          team: { id: 'my-crazy-team-name' },
        },
      }));

      updateMottoStub = sinon.stub(robot.client, 'updateMotto').returns(Promise.resolve({
        ok: false,
        statusCode: 403,
      }));

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: 'jerry@jerry.jerry' } } as User);

      return room.user.say(userName, `@hubot our motto is ${motto}`);
    });

    it('should tell the user they do not have permission', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot our motto is ${motto}`],
        ['hubot', `@${userName} Sorry, only team members can change the motto.`],
      ]);
    });
  });

  describe('when user not in a team', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userName = 'jerry';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userName,
          team: {},
        },
      }));

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: 'jerry@jerry.jerry' } } as User);

      return room.user.say(userName, '@hubot our motto is We are great');
    });

    it('should tell the user the motto is changed', () => {
      expect(room.messages).to.eql([
        [userName, '@hubot our motto is We are great'],
        ['hubot', `@${userName} You're not in a team! :goberserk:`],
      ]);
    });
  });

  describe('when user unknown', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userName = 'jerry';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404,
      }));

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: 'jerry@jerry.jerry' } } as User);

      return room.user.say(userName, '@hubot our motto is We are great');
    });

    it('should tell the user the motto is changed', () => {
      expect(room.messages).to.eql([
        [userName, '@hubot our motto is We are great'],
        ['hubot', `@${userName} You're not in a team! :goberserk:`],
      ]);
    });
  });
});
