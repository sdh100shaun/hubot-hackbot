import { expect } from 'chai';
import * as sinon from 'sinon';
import { RobotWithClient } from '../hackbot';
import { UserData } from 'hubot';
import * as Helper from 'hubot-test-helper';

describe('@hubot create team X', () => {

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

  describe('when user already exists and not in a team', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;
    let createTeamStub: sinon.SinonStub;

    before(() => {
      userId = 'bob'
      userEmail = 'pinny.espresso@food.co'
      teamName = 'Pineapple Express'

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userId,
          team: {}
        }
      }));

      createTeamStub = sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({ ok: true }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should create the team', () => {
      expect(createTeamStub).to.have.been.calledWith(teamName, userId, userEmail);
    });

    it('should welcome the user to the team', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} Welcome to team ${teamName}!`]
      ]);
    });
  });

  describe('when user already exists and not a registered attendee', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;
    let createTeamStub: sinon.SinonStub;

    before(() => {
      userId = 'bob'
      userEmail = 'pinny.espresso@food.co'
      teamName = 'Pineapple Express'

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userId,
          team: {}
        }
      }));

      createTeamStub = sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({
        ok: false,
        statusCode: 403
      }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should not welcome the user to the team', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} Sorry, you don't have permission to create a team.`]
      ]);
    });
  });

  describe('when user already exists and is already in a team', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let teamId: string;
    let teamName: string;
    let existingTeamId: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userId = 'barry'
      teamId = 'bodaz'
      teamName = 'Bobby Dazzlers'
      existingTeamId = 'pineapple-express'
      existingTeamName = 'Pineapple Express'

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName
          }
        }
      }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: 'sadadd'
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should tell the user that they cannot be in more than one team', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} You're already a member of ${existingTeamName}!`]
      ]);
    });
  });

  describe('when user already exists and team already exists', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;
    let createTeamStub: sinon.SinonStub;

    before(() => {
      userId = 'jerry'
      userEmail = 'jerry@jerry.jerry'
      teamName = 'Top Bants'

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {}
        }
      }));

      createTeamStub = sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({
        ok: false,
        statusCode: 409
      }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should try to create the team', () => {
      expect(createTeamStub).to.have.been.calledWith(teamName, userId, userEmail);
    });

    it('should tell the user that the team already exists', () => {
      expect(room.messages).to.eql([
        [userId, '@hubot create team Top Bants'],
        ['hubot', `@${userId} Sorry, but that team already exists!`]
      ]);
    });
  });

  describe('when user does not already exist and team does not already exist', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;
    let createUserStub: sinon.SinonStub;
    let createTeamStub: sinon.SinonStub;

    before(() => {
      userId = 'sarah'
      userEmail = 'sarah@sarah.sarah'
      teamName = 'Pineapple Express'

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404
      }));

      createUserStub = sinon.stub(robot.client, 'createUser').returns(Promise.resolve({ ok: true }));

      createTeamStub = sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({ ok: true }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should create the user', () => {
      expect(createUserStub).to.have.been.calledWith(userId, userId, userEmail);
    });

    it('should create the team', () => {
      expect(createTeamStub).to.have.been.calledWith(teamName, userId, userEmail);
    });

    it('should welcome the new user to the new team', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} Welcome to team ${teamName}!`]
      ]);
    });
  });

  describe('when user does not already exist and not a registered attendee', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;
    let createUserStub: sinon.SinonStub;

    before(() => {
      userId = 'sarah'
      userEmail = 'sarah@sarah.sarah'
      teamName = 'Pineapple Express'

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404
      }));

      createUserStub = sinon.stub(robot.client, 'createUser').returns(Promise.resolve({
        ok: false,
        statusCode: 403
      }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should welcome the new user to the new team', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} Sorry, you don\'t have permission to create a team.`]
      ]);
    });
  });

  describe('when user does not already exist and create user returns(an unexpected code', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let userEmail: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;
    let createUserStub: sinon.SinonStub;

    before(() => {
      userId = 'hannah'
      userEmail = 'an.email.address'
      teamName = ':melon:'

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404
      }));

      createUserStub = sinon.stub(robot.client, 'createUser').returns(Promise.resolve({
        ok: false,
        statusCode: 54
      }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: userEmail
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userId);
    });

    it('should create the user', () => {
      expect(createUserStub).to.have.been.calledWith(userId, userId);
    });

    it('should tell the user that their user account could not be created', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} Sorry, I can't create your user account :frowning:`]
      ]);
    });
  });

  describe('when user does not already exist and creating the team returns(an unexpected code', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let teamName: string;

    before(() => {
      userId = 'sarah'
      teamName = 'Whizzbang'

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({ ok: false, statusCode: 404 }));
      sinon.stub(robot.client, 'createUser').returns(Promise.resolve({ ok: true, statusCode: 201 }));
      sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({ ok: false, statusCode: 503 }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: 'another.email.address'
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should tell the user that the team could not be created', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} Sorry, I can't create your team :frowning:`]
      ]);
    });
  });

  describe('when user already exists and creating the team returns(an unexpected code', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let teamName: string;

    before(() => {
      userId = 'sarah'
      teamName = 'Whizzbang'

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {}
        }
      }));

      sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({ ok: false, statusCode: 503 }));

      robot.brain.data.users[userId] = <UserData>{
        email_address: 'some.email.address'
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should tell the user that the team could not be created', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} Sorry, I can't create your team :frowning:`]
      ]);
    });
  });

  describe('when getUser fails', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let teamName: string;

    before(() => {
      userId = 'sarah'
      teamName = 'Rosie'

      sinon.stub(robot.client, 'getUser').returns(Promise.reject(new Error('unknown')));

      robot.brain.data.users[userId] = <UserData>{
        email_address: 'bark'
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} I'm sorry, there appears to be a big problem!`]
      ]);
    });
  });

  describe('when user does not exist and createUser fails', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let teamName: string;

    before(() => {
      userId = 'sarah'
      teamName = 'Rosie'

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({ ok: false, statusCode: 404 }));
      sinon.stub(robot.client, 'createUser').returns(Promise.reject(new Error('unknown')));

      robot.brain.data.users[userId] = <UserData>{
        email_address: 'bark'
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} I'm sorry, there appears to be a big problem!`]
      ]);
    });
  });

  describe('when created user and createTeam fails', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let teamName: string;

    before(() => {
      userId = 'sarah'
      teamName = 'Rosie'

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({ ok: true, user: {} }));
      sinon.stub(robot.client, 'createUser').returns({ ok: true });
      sinon.stub(robot.client, 'createTeam').returns(Promise.reject(new Error('unknown')));

      robot.brain.data.users[userId] = <UserData>{
        email_address: 'bark'
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} I'm sorry, there appears to be a big problem!`]
      ]);
    });
  });

  describe('when user already exists and createTeam fails', () => {

    before(setUp);
    after(tearDown);

    let userId: string;
    let teamName: string;

    before(() => {
      userId = 'sarah'
      teamName = 'Rosie'

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({ ok: true, user: {} }));
      sinon.stub(robot.client, 'createTeam').returns(Promise.reject(new Error('unknown')));

      robot.brain.data.users[userId] = <UserData>{
        email_address: 'bark'
      };

      return room.user.say(userId, `@hubot create team ${teamName}`);
    });

    after(() => {
      room.destroy();
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [userId, `@hubot create team ${teamName}`],
        ['hubot', `@${userId} I'm sorry, there appears to be a big problem!`]
      ]);
    });
  });
});