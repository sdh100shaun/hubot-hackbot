import { expect } from 'chai';
import * as sinon from 'sinon';
import { RobotWithClient } from '../hackbot';
import { MemoryDataStore, User } from '@slack/client';
import * as Helper from 'hubot-test-helper';

describe('@hubot leave my team', () => {

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

  describe('when in a team', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let userEmail: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let removeTeamMemberStub: sinon.SinonStub;

    before(() => {
      userName = 'micah';
      userEmail = 'micah.micah~micah';
      existingTeamId = 'ocean-mongrels';
      existingTeamName = 'Ocean Mongrels';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName,
          },
        },
      }));

      removeTeamMemberStub = sinon.stub(robot.client, 'removeTeamMember').returns(Promise.resolve({ ok: true }));

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: userEmail } } as User);

      return room.user.say(userName, '@hubot leave my team');
    });

    it('should get the user', () => {
      expect(getUserStub).to.have.been.calledWith(userName);
    });

    it('should update the team, excluding the current user in the member list', () => {
      expect(removeTeamMemberStub).to.have.been.calledWith(existingTeamId, userName, userEmail);
    });

    it('should tell the user that they have left the team', () => {
      expect(room.messages).to.eql([
        [userName, '@hubot leave my team'],
        ['hubot', `@${userName} OK, you've been removed from team "${existingTeamName}"`],
      ]);
    });
  });

  describe('when not a registered attendee', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let userEmail: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let removeTeamMemberStub: sinon.SinonStub;

    before(() => {
      userName = 'micah';
      userEmail = 'micah.micah~micah';
      existingTeamId = 'ocean-mongrels';
      existingTeamName = 'Ocean Mongrels';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName,
          },
        },
      }));

      removeTeamMemberStub = sinon.stub(robot.client, 'removeTeamMember').returns(Promise.resolve({
        ok: false,
        statusCode: 403,
      }));

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: userEmail } } as User);

      return room.user.say(userName, '@hubot leave my team');
    });

    it('should tell the user that they have left the team', () => {
      expect(room.messages).to.eql([
        [userName, '@hubot leave my team'],
        ['hubot', `@${userName} Sorry, you don't have permission to leave your team.`],
      ]);
    });
  });

  describe('when not in a team', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userName = 'sarah';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: undefined,
          },
        },
      }));

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName } as User);

      return room.user.say(userName, '@hubot leave my team');
    });

    it('should get the user', () => {
      expect(getUserStub).to.have.been.calledWith(userName);
    });

    it('should tell the user that they are not in a team', () => {
      expect(room.messages).to.eql([
        [userName, '@hubot leave my team'],
        ['hubot', `@${userName} You're not in a team! :goberserk:`],
      ]);
    });
  });

  describe('when user does not exist', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userName = 'sarah';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404,
      }));

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: 'sdfsfdsfsdf' } } as User);

      return room.user.say(userName, '@hubot leave my team');
    });

    it('should get the user', () => {
      expect(getUserStub).to.have.been.calledWith(userName);
    });

    it('should tell the user that they are not in a team', () => {
      expect(room.messages).to.eql([
        [userName, '@hubot leave my team'],
        ['hubot', `@${userName} You're not in a team! :goberserk:`],
      ]);
    });
  });

  describe('when getUser fails', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let error: Error;
    let emitStub: sinon.SinonStub;

    before(() => {
      userName = 'sarah';
      error = new Error('when getUser fails');

      sinon.stub(robot.client, 'getUser').returns(Promise.reject(error));
      emitStub = sinon.stub(robot, 'emit');

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName } as User);

      return room.user.say(userName, '@hubot leave my team');
    });

    it('should emit the error', () => {
      expect(emitStub).to.have.been.calledWith('error', error, sinon.match.object);
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [userName, '@hubot leave my team'],
        ['hubot', `@${userName} I'm sorry, there appears to be a big problem!`],
      ]);
    });
  });

  describe('when removeTeamMember fails', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let error: Error;
    let emitStub: sinon.SinonStub;

    before(() => {
      userName = 'sarah';
      error = new Error('when removeTeamMember fails');

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: { id: 'teamid' },
        },
      }));

      sinon.stub(robot.client, 'removeTeamMember').returns(Promise.reject(error));
      emitStub = sinon.stub(robot, 'emit');

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: 'sdfsfdsfsdf' } } as User);

      return room.user.say(userName, '@hubot leave my team');
    });

    it('should emit the error', () => {
      expect(emitStub).to.have.been.calledWith('error', error, sinon.match.object);
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [userName, '@hubot leave my team'],
        ['hubot', `@${userName} I\'m sorry, there appears to be a big problem!`],
      ]);
    });
  });
});
