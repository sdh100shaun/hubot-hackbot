import { expect } from 'chai';
import * as sinon from 'sinon';
import { RobotWithClient } from '../hackbot';
import { UserData } from 'hubot';
import * as Helper from 'hubot-test-helper';

describe('@hubot leave my team', () => {

  let helper: Helper.Helper;
  let room: Helper.Room;
  let robot: RobotWithClient;

  before(() => helper = new Helper('../index.js'));

  function setUp() {
    room = helper.createRoom();
    robot = <RobotWithClient>room.robot;
  };

  function tearDown() {
    room.destroy();
  }

  describe('when in a team', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let removeTeamMemberStub: sinon.SinonStub;

    before(() => {
      userId = 'micah'
      userEmail = 'micah.micah~micah'
      existingTeamId = 'ocean-mongrels'
      existingTeamName = 'Ocean Mongrels'

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName
          }
        }
      }));

      removeTeamMemberStub = sinon.stub(robot.client, 'removeTeamMember').returns(Promise.resolve({ ok: true }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      return room.user.say(userId, '@hubot leave my team');
    });

    it('should get the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should update the team, excluding the current user in the member list', () => {
      expect(removeTeamMemberStub).to.have.been.calledWith(existingTeamId, userId, userEmail);
    });

    it('should tell the user that they have left the team', () => {
      expect(room.messages).to.eql([
        [userId, '@hubot leave my team'],
        ['hubot', `@${userId} OK, you've been removed from team "${existingTeamName}"`]
      ]);
    });
  });

  describe('when not a registered attendee', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let removeTeamMemberStub: sinon.SinonStub;

    before(() => {
      userId = 'micah'
      userEmail = 'micah.micah~micah'
      existingTeamId = 'ocean-mongrels'
      existingTeamName = 'Ocean Mongrels'

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName
          }
        }
      }));

      removeTeamMemberStub = sinon.stub(robot.client, 'removeTeamMember').returns(Promise.resolve({
        ok: false,
        statusCode: 403
      }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      return room.user.say(userId, '@hubot leave my team');
    });

    it('should tell the user that they have left the team', () => {
      expect(room.messages).to.eql([
        [userId, '@hubot leave my team'],
        ['hubot', `@${userId} Sorry, you don't have permission to leave your team.`]
      ]);
    });
  });

  describe('when not in a team', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userId = 'sarah'

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: undefined
          }
        }
      }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: 'asdlkjalkdsjas'
      };

      return room.user.say(userId, '@hubot leave my team');
    });

    it('should get the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should tell the user that they are not in a team', () => {
      expect(room.messages).to.eql([
        [userId, '@hubot leave my team'],
        ['hubot', `@${userId} You're not in a team! :goberserk:`]
      ]);
    });
  });

  describe('when user does not exist', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userId = 'sarah'

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404
      }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: 'sdfsfdsfsdf'
      };

      return room.user.say(userId, '@hubot leave my team');
    });

    it('should get the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should tell the user that they are not in a team', () => {
      expect(room.messages).to.eql([
        [userId, '@hubot leave my team'],
        ['hubot', `@${userId} You're not in a team! :goberserk:`]
      ]);
    });
  });

  describe('when getUser fails', () => {

    before(setUp);
    after(tearDown);

    before(() => {
      sinon.stub(robot.client, 'getUser').returns(Promise.reject(new Error('unknown')));

      return room.user.say('sarah', '@hubot leave my team');
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        ['sarah', '@hubot leave my team'],
        ['hubot', '@sarah I\'m sorry, there appears to be a big problem!']
      ]);
    });
  });

  describe('when removeTeamMember fails', () => {

    before(setUp);
    after(tearDown);

    before(() => {
      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: { id: '234324' }
        }
      }));

      sinon.stub(robot.client, 'removeTeamMember').returns(Promise.reject(new Error('when removeTeamMember fails')));

      return room.user.say('sarah', '@hubot leave my team');
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        ['sarah', '@hubot leave my team'],
        ['hubot', '@sarah I\'m sorry, there appears to be a big problem!']
      ]);
    });
  });
});
