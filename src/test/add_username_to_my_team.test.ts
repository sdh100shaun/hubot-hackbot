import { expect } from 'chai';
import * as sinon from 'sinon';
import { RobotWithClient } from '../hackbot';
import { UserData } from 'hubot';
import * as Helper from 'hubot-test-helper';

describe('@hubot add @username to my team', () => {
  
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
    let otherUserId: string;
    let otherUserUsername: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let addUserToTeamStub: sinon.SinonStub;

    before(() => {
      userId = 'micah';
      userEmail = 'micah.micah~micah';
      otherUserId = 'polly';
      otherUserUsername = 'abcdefghijklmnopqrstuvwxyz.-_0123456789';
      existingTeamId = 'ocean-mongrels';
      existingTeamName = 'Ocean Mongrels';

      getUserStub = sinon.stub(robot.client, 'getUser');
      getUserStub.withArgs(userId).returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName
          }
        }
      }));

      getUserStub
        .withArgs(otherUserId)
        .returns(Promise.resolve({
          ok: true,
          statusCode: 200
        }));

      addUserToTeamStub = sinon.stub(robot.client, 'addUserToTeam').returns(Promise.resolve({ ok: true }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      robot.brain.data.users[otherUserId] = <UserData>{
        id: otherUserId,
        name: otherUserUsername
      };

      return room.user.say(userId, `@hubot add @${otherUserUsername} to my team`);
    });

    it('should get the current user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should get the other user', () => {
      expect(getUserStub).to.have.been.calledWith(otherUserId);
    });

    it('should add the other user to the team', () => {
      expect(addUserToTeamStub).to.have.been.calledWith(existingTeamId, otherUserId, userEmail);
    });

    it('should tell the user that the command has completed', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot add @${otherUserUsername} to my team`],
        ['hubot', `@${userId} Done!`]
      ]);
    });
  });

  describe('when username has a trailing space', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let otherUserId: string;
    let otherUserUsername: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let addUserToTeamStub: sinon.SinonStub;

    before(() => {
      userId = 'micah';
      userEmail = 'micah.micah~micah';
      otherUserId = 'polly';
      otherUserUsername = 'pollygrafanaasa';
      existingTeamId = 'ocean-mongrels';
      existingTeamName = 'Ocean Mongrels';

      getUserStub = sinon.stub(robot.client, 'getUser');
      getUserStub
        .withArgs(userId)
        .returns(Promise.resolve({
          ok: true,
          user: {
            team: {
              id: existingTeamId,
              name: existingTeamName
            }
          }
        }));

      getUserStub
        .withArgs(otherUserId)
        .returns(Promise.resolve({
          ok: true,
          statusCode: 200
        }));

      addUserToTeamStub = sinon.stub(robot.client, 'addUserToTeam').returns(Promise.resolve({ ok: true }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      robot.brain.data.users[otherUserId] = <UserData>{
        id: otherUserId,
        name: otherUserUsername
      };

      return room.user.say(userId, `@hubot add @${otherUserUsername}  to my team`);
    });

    it('should get the current user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should get the other user', () => {
      expect(getUserStub).to.have.been.calledWith(otherUserId);
    });

    it('should add the other user to the team', () => {
      expect(addUserToTeamStub).to.have.been.calledWith(existingTeamId, otherUserId, userEmail);
    });

    it('should tell the user that the command has completed', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot add @${otherUserUsername}  to my team`],
        ['hubot', `@${userId} Done!`]
      ]);
    });
  });

  describe('when not an attendee', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let otherUserId: string;
    let otherUserUsername: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let addUserToTeamStub: sinon.SinonStub;

    before(() => {
      userId = 'micah';
      userEmail = 'micah.micah~micah';
      otherUserId = 'polly';
      otherUserUsername = 'pollygrafanaasa';
      existingTeamId = 'ocean-mongrels';
      existingTeamName = 'Ocean Mongrels';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName
          }
        }
      }));

      addUserToTeamStub = sinon.stub(robot.client, 'addUserToTeam').returns(Promise.resolve({
        ok: false,
        statusCode: 403
      }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      robot.brain.data.users[otherUserId] = <UserData>{
        name: otherUserUsername
      };

      return room.user.say(userId, `@hubot add @${otherUserUsername} to my team`);
    })

    it('should tell the user that they do not have permission', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot add @${otherUserUsername} to my team`],
        ['hubot', `@${userId} Sorry, you don't have permission to add people to your team.`]
      ]);
    });
  });

  describe('when not in a team', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let otherUserUsername: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userId = 'micah';
      userEmail = 'micah.micah~micah';
      otherUserUsername = 'pollygrafanaasa';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {}
        }
      }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      return room.user.say(userId, `@hubot add @${otherUserUsername} to my team`);
    });

    it('shouldtell the user that they are not in a team', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot add @${otherUserUsername} to my team`],
        ['hubot', `@${userId} I would, but you're not in a team...`]
      ]);
    });
  });

  describe('when user is not already a member', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let otherUserId: string;
    let otherUserUsername: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let createUserStub: sinon.SinonStub;
    let addUserToTeamStub: sinon.SinonStub;

    before(() => {
      userId = 'micah'
      userEmail = 'micah.micah~micah'
      otherUserId = 'polly'
      otherUserUsername = 'pollygrafanaasa'
      existingTeamId = 'ocean-mongrels'
      existingTeamName = 'Ocean Mongrels'

      getUserStub = sinon.stub(robot.client, 'getUser');
      getUserStub.withArgs(userId).returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName
          }
        }
      }));

      getUserStub.withArgs(otherUserId).returns(Promise.resolve({
        ok: false,
        statusCode: 404
      }));

      createUserStub = sinon.stub(robot.client, 'createUser').returns(Promise.resolve({ ok: true }));

      addUserToTeamStub = sinon.stub(robot.client, 'addUserToTeam').returns(Promise.resolve({ ok: true }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      robot.brain.data.users[otherUserId] = <UserData>{
        id: otherUserId,
        name: otherUserUsername
      };

      return room.user.say(userId, `@hubot add @${otherUserUsername} to my team`);
    });

    it('should get the current user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should get the other user', () => {
      expect(getUserStub).to.have.been.calledWith(otherUserId);
    });

    it('should create the other user', () => {
      expect(createUserStub).to.have.been.calledWith(otherUserId, otherUserUsername, userEmail);
    });

    it('should add the other user to the team', () => {
      expect(addUserToTeamStub).to.have.been.calledWith(existingTeamId, otherUserId, userEmail);
    });

    it('should tell the user that the command has completed', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot add @${otherUserUsername} to my team`],
        ['hubot', `@${userId} Done!`]
      ]);
    });
  });

  describe('when other user already in a team', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let otherUserId: string;
    let otherUserUsername: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let addUserToTeamStub: sinon.SinonStub;

    before(() => {
      userId = 'micah'
      userEmail = 'micah.micah~micah'
      otherUserId = 'polly'
      otherUserUsername = 'pollygrafanaasa'
      existingTeamId = 'ocean-mongrels'
      existingTeamName = 'Ocean Mongrels'

      getUserStub = sinon.stub(robot.client, 'getUser');
      getUserStub.withArgs(userId).returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName
          }
        }
      }));

      getUserStub.withArgs(otherUserId).returns(Promise.resolve({
        ok: true,
        statusCode: 200
      }));

      addUserToTeamStub = sinon.stub(robot.client, 'addUserToTeam').returns(Promise.resolve({
        ok: false,
        statusCode: 400
      }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      robot.brain.data.users[otherUserId] = <UserData>{
        id: otherUserId,
        name: otherUserUsername
      };

      return room.user.say(userId, `@hubot add @${otherUserUsername} to my team`);
    });

    it('should tell the user that the other user may already be in a team', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot add @${otherUserUsername} to my team`],
        ['hubot', `@${userId} Sorry, ${otherUserUsername} is already in another team and must leave that team first.`]
      ]);
    });
  });

});
