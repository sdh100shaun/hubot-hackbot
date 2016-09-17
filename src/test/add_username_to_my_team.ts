import { expect, use as chaiUse } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { RobotWithHack24Client } from '../hackbot';
import { UserData } from 'hubot';
import { Client } from '../client';

chaiUse(sinonChai);

import * as Helper from 'hubot-test-helper';
const helper = new Helper('../hackbot.js');

describe('@hubot add @username to my team', () => {

  describe('when in a team', () => {

    let room: Helper.Room;
    let userId: string;
    let userEmail: string;
    let otherUserId: string;
    let otherUserUsername: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let addUserToTeamStub: sinon.SinonStub;

    before(() => {
      room = helper.createRoom();

      userId = 'micah';
      userEmail = 'micah.micah~micah';
      otherUserId = 'polly';
      otherUserUsername = 'abcdefghijklmnopqrstuvwxyz.-_0123456789';
      existingTeamId = 'ocean-mongrels';
      existingTeamName = 'Ocean Mongrels';

      getUserStub = sinon.stub();
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

      addUserToTeamStub = sinon.stub().returns(Promise.resolve({ ok: true }));

      const robot = <RobotWithHack24Client>room.robot;

      robot.hack24client = <any>{
        getUser: getUserStub,
        addUserToTeam: addUserToTeamStub
      };

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

    after(() => {
      room.destroy();
    });
  });

  describe('when username has a trailing space', () => {

    let room: Helper.Room;
    let userId: string;
    let userEmail: string;
    let otherUserId: string;
    let otherUserUsername: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let addUserToTeamStub: sinon.SinonStub;

    before(() => {
      room = helper.createRoom();

      userId = 'micah';
      userEmail = 'micah.micah~micah';
      otherUserId = 'polly';
      otherUserUsername = 'pollygrafanaasa';
      existingTeamId = 'ocean-mongrels';
      existingTeamName = 'Ocean Mongrels';

      getUserStub = sinon.stub()
      getUserStub.withArgs(userId).returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName
          }
        }
      }));

      getUserStub.withArgs(otherUserId).returns(Promise.resolve({ ok: true, statusCode: 200 }));

      addUserToTeamStub = sinon.stub().returns(Promise.resolve({ ok: true }));
      
      const robot = <RobotWithHack24Client>room.robot;

      robot.hack24client = <any> {
        getUser: getUserStub,
        addUserToTeam: addUserToTeamStub
      };

      robot.brain.data.users[userId] = <UserData> {
        email_address: userEmail
      };

      robot.brain.data.users[otherUserId] = <UserData> {
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

    after(() => {
      room.destroy();
    });
  });

  describe('when not an attendee', () => {

    let room: Helper.Room;

    let userId: string;
    let userEmail: string;
    let otherUserId: string;
    let otherUserUsername: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let addUserToTeamStub: sinon.SinonStub;

    before(() => {
      room = helper.createRoom()

      userId = 'micah';
      userEmail = 'micah.micah~micah';
      otherUserId = 'polly';
      otherUserUsername = 'pollygrafanaasa';
      existingTeamId = 'ocean-mongrels';
      existingTeamName = 'Ocean Mongrels';

      getUserStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName
          }
        }
      }));

      addUserToTeamStub = sinon.stub().returns(Promise.resolve({
        ok: false,
        statusCode: 403
      }));

      const robot = <RobotWithHack24Client> room.robot;

      robot.hack24client = <any> {
        getUser: getUserStub,
        addUserToTeam: addUserToTeamStub
      };

      robot.brain.data.users[userId] = <UserData> {
        email_address: userEmail
      };

      robot.brain.data.users[otherUserId] = <UserData> {
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

    after(() => {
      room.destroy();
    });
  });

  describe('when not in a team', () => {

    let room: Helper.Room;

    let userId: string;
    let userEmail: string;
    let otherUserUsername: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      room = helper.createRoom();

      userId = 'micah';
      userEmail = 'micah.micah~micah';
      otherUserUsername = 'pollygrafanaasa';

      getUserStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        user: {
          team: {}
        }
      }));

      const robot = <RobotWithHack24Client> room.robot;

      robot.hack24client = <any> {
        getUser: getUserStub
      };

      robot.brain.data.users[userId] = <UserData> {
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

    after(() => {
      room.destroy();
    });
  });

  describe('when user is not already a member', () => {

    let room: Helper.Room;
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
      room = helper.createRoom()

      userId = 'micah'
      userEmail = 'micah.micah~micah'
      otherUserId = 'polly'
      otherUserUsername = 'pollygrafanaasa'
      existingTeamId = 'ocean-mongrels'
      existingTeamName = 'Ocean Mongrels'

      getUserStub = sinon.stub()
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

      createUserStub = sinon.stub().returns(Promise.resolve({
        ok: true
      }));

      addUserToTeamStub = sinon.stub().returns(Promise.resolve({
        ok: true
      }));

      const robot = <RobotWithHack24Client> room.robot;

      robot.hack24client = <any> {
        getUser: getUserStub,
        addUserToTeam: addUserToTeamStub,
        createUser: createUserStub
      };

      robot.brain.data.users[userId] = <UserData> {
        email_address: userEmail
      };

      robot.brain.data.users[otherUserId] = <UserData> {
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

    after(() => {
      room.destroy();
    });
  });

  describe('when other user already in a team', () => {

    let room: Helper.Room;
    let userId: string;
    let userEmail: string;
    let otherUserId: string;
    let otherUserUsername: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;
    let addUserToTeamStub: sinon.SinonStub;

    before(() => {
      room = helper.createRoom()

      userId = 'micah'
      userEmail = 'micah.micah~micah'
      otherUserId = 'polly'
      otherUserUsername = 'pollygrafanaasa'
      existingTeamId = 'ocean-mongrels'
      existingTeamName = 'Ocean Mongrels'

      getUserStub = sinon.stub()
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

      addUserToTeamStub = sinon.stub().returns(Promise.resolve({
        ok: false,
        statusCode: 400
      }));

      const robot = <RobotWithHack24Client> room.robot;

      robot.hack24client = <any> {
        getUser: getUserStub,
        addUserToTeam: addUserToTeamStub
      };

      robot.brain.data.users[userId] = <UserData> {
        email_address: userEmail
      };

      robot.brain.data.users[otherUserId] = <UserData> {
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

    after(() => {
      room.destroy();
    });
  });

});