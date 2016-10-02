import { expect } from 'chai';
import * as sinon from 'sinon';
import { RobotWithClient } from '../hackbot';
import { SlackBotClient } from 'hubot-slack';
import { MemoryDataStore, User } from '@slack/client';
import * as Helper from 'hubot-test-helper';

describe('@hubot create team X', () => {

  let helper: Helper.Helper;
  let room: Helper.Room;
  let robot: RobotWithClient;
  let dataStore: MemoryDataStore;

  before(() => helper = new Helper('../index.js'));

  function setUp() {
    room = helper.createRoom();
    robot = <RobotWithClient> room.robot;
    dataStore = new MemoryDataStore();
    robot.adapter.client = <SlackBotClient> { rtm: { dataStore: dataStore } };
  }

  function tearDown() {
    room.destroy();
  }

  describe('when user already exists and not in a team', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let userEmail: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;
    let createTeamStub: sinon.SinonStub;

    before(() => {
      userName = 'bob';
      userEmail = 'pinny.espresso@food.co';
      teamName = 'Pineapple Express';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userName,
          team: {},
        },
      }));

      createTeamStub = sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({ ok: true }));

      sinon.stub(dataStore, 'getUserById').withArgs(userName).returns({ id: userName, profile: { email: userEmail } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userName);
    });

    it('should create the team', () => {
      expect(createTeamStub).to.have.been.calledWith(teamName, userName, userEmail);
    });

    it('should welcome the user to the team', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} Welcome to team ${teamName}!`],
      ]);
    });
  });

  describe('when user already exists and not a registered attendee', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let teamName: string;

    before(() => {
      userName = 'bob';
      const userEmail = 'pinny.espresso@food.co';
      teamName = 'Pineapple Express';

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          id: userName,
          team: {},
        },
      }));

      sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({
        ok: false,
        statusCode: 403,
      }));

      sinon.stub(dataStore, 'getUserById').withArgs(userName).returns({ id: userName, profile: { email: userEmail } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should not welcome the user to the team', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} Sorry, you don't have permission to create a team.`],
      ]);
    });
  });

  describe('when user already exists and is already in a team', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let teamName: string;
    let existingTeamName: string;
    let getUserStub: sinon.SinonStub;

    before(() => {
      userName = 'barry';
      teamName = 'Bobby Dazzlers';
      const existingTeamId = 'pineapple-express';
      existingTeamName = 'Pineapple Express';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: existingTeamId,
            name: existingTeamName,
          },
        },
      }));

      sinon.stub(dataStore, 'getUserById').withArgs(userName).returns({ id: userName, profile: {} } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userName);
    });

    it('should tell the user that they cannot be in more than one team', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} You're already a member of ${existingTeamName}!`],
      ]);
    });
  });

  describe('when user already exists and team already exists', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let userEmail: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;
    let createTeamStub: sinon.SinonStub;

    before(() => {
      userName = 'jerry';
      userEmail = 'jerry@jerry.jerry';
      teamName = 'Top Bants';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {},
        },
      }));

      createTeamStub = sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({
        ok: false,
        statusCode: 409,
      }));

      sinon.stub(dataStore, 'getUserById').withArgs(userName).returns({ id: userName, profile: { email: userEmail } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userName);
    });

    it('should try to create the team', () => {
      expect(createTeamStub).to.have.been.calledWith(teamName, userName, userEmail);
    });

    it('should tell the user that the team already exists', () => {
      expect(room.messages).to.eql([
        [userName, '@hubot create team Top Bants'],
        ['hubot', `@${userName} Sorry, but that team already exists!`],
      ]);
    });
  });

  describe('when user does not already exist and team does not already exist', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let userEmail: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;
    let createUserStub: sinon.SinonStub;
    let createTeamStub: sinon.SinonStub;

    before(() => {
      userName = 'sarah';
      userEmail = 'sarah@sarah.sarah';
      teamName = 'Pineapple Express';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404,
      }));

      createUserStub = sinon.stub(robot.client, 'createUser').returns(Promise.resolve({ ok: true }));
      createTeamStub = sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({ ok: true }));

      sinon.stub(dataStore, 'getUserById').withArgs(userName).returns({ id: userName, profile: { email: userEmail } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userName);
    });

    it('should create the user', () => {
      expect(createUserStub).to.have.been.calledWith(userName, userName, userEmail);
    });

    it('should create the team', () => {
      expect(createTeamStub).to.have.been.calledWith(teamName, userName, userEmail);
    });

    it('should welcome the new user to the new team', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} Welcome to team ${teamName}!`],
      ]);
    });
  });

  describe('when user does not already exist and not a registered attendee', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let userEmail: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;
    let createUserStub: sinon.SinonStub;

    before(() => {
      userName = 'sarah';
      userEmail = 'sarah@sarah.sarah';
      teamName = 'Pineapple Express';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404,
      }));

      createUserStub = sinon.stub(robot.client, 'createUser').returns(Promise.resolve({
        ok: false,
        statusCode: 403,
      }));

      sinon.stub(dataStore, 'getUserById').withArgs(userName).returns({ id: userName, profile: { email: userEmail } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should welcome the new user to the new team', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} Sorry, you don\'t have permission to create a team.`],
      ]);
    });
  });

  describe('when user does not already exist and create user returns(an unexpected code', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let userEmail: string;
    let teamName: string;
    let getUserStub: sinon.SinonStub;
    let createUserStub: sinon.SinonStub;

    before(() => {
      userName = 'hannah';
      userEmail = 'an.email.address';
      teamName = ':melon:';

      getUserStub = sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: false,
        statusCode: 404,
      }));

      createUserStub = sinon.stub(robot.client, 'createUser').returns(Promise.resolve({
        ok: false,
        statusCode: 54,
      }));

      sinon.stub(dataStore, 'getUserById').withArgs(userName).returns({ id: userName, profile: { email: userEmail } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should fetch the user', () => {
      expect(getUserStub).to.have.been.calledWith(userName);
    });

    it('should create the user', () => {
      expect(createUserStub).to.have.been.calledWith(userName, userName);
    });

    it('should tell the user that their user account could not be created', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} Sorry, I can't create your user account :frowning:`],
      ]);
    });
  });

  describe('when user does not already exist and creating the team returns(an unexpected code', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let teamName: string;

    before(() => {
      userName = 'sarah';
      teamName = 'Whizzbang';

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({ ok: false, statusCode: 404 }));
      sinon.stub(robot.client, 'createUser').returns(Promise.resolve({ ok: true, statusCode: 201 }));
      sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({ ok: false, statusCode: 503 }));

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: 'another.email.address' } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should tell the user that the team could not be created', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} Sorry, I can't create your team :frowning:`],
      ]);
    });
  });

  describe('when user already exists and creating the team returns(an unexpected code', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let teamName: string;

    before(() => {
      userName = 'sarah';
      teamName = 'Whizzbang';

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({
        ok: true,
        user: {
          team: {},
        },
      }));

      sinon.stub(robot.client, 'createTeam').returns(Promise.resolve({ ok: false, statusCode: 503 }));

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: 'some.email.address' } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should tell the user that the team could not be created', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} Sorry, I can't create your team :frowning:`],
      ]);
    });
  });

  describe('when getUser fails', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let teamName: string;
    let error: Error;
    let emitStub: sinon.SinonSpy;

    before(() => {
      userName = 'sarah';
      teamName = 'Rosie';
      error = new Error('when getUser fails');

      sinon.stub(robot.client, 'getUser').returns(Promise.reject(error));
      emitStub = sinon.stub(robot, 'emit');

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: 'bark' } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should emit the error', () => {
      expect(emitStub).to.have.been.calledWith('error', error, sinon.match.object);
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} I'm sorry, there appears to be a big problem!`],
      ]);
    });
  });

  describe('when user does not exist and createUser fails', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let teamName: string;
    let error: Error;
    let emitStub: sinon.SinonSpy;

    before(() => {
      userName = 'sarah';
      teamName = 'Rosie';
      error = new Error('when user does not exist and createUser fails');

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({ ok: false, statusCode: 404 }));
      sinon.stub(robot.client, 'createUser').returns(Promise.reject(error));
      emitStub = sinon.stub(robot, 'emit');

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: 'bark' } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should emit the error', () => {
      expect(emitStub).to.have.been.calledWith('error', error, sinon.match.object);
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} I'm sorry, there appears to be a big problem!`],
      ]);
    });
  });

  describe('when created user and createTeam fails', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let teamName: string;
    let error: Error;
    let emitStub: sinon.SinonSpy;

    before(() => {
      userName = 'sarah';
      teamName = 'Rosie';
      error = new Error('when created user and createTeam fails');

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({ ok: true, user: { team: {} } }));
      sinon.stub(robot.client, 'createUser').returns({ ok: true });
      sinon.stub(robot.client, 'createTeam').returns(Promise.reject(error));
      emitStub = sinon.stub(robot, 'emit');

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: 'bark' } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should emit the error', () => {
      expect(emitStub).to.have.been.calledWith('error', error, sinon.match.object);
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} I'm sorry, there appears to be a big problem!`],
      ]);
    });
  });

  describe('when user already exists and createTeam fails', () => {

    before(setUp);
    after(tearDown);

    let userName: string;
    let teamName: string;
    let error: Error;
    let emitStub: sinon.SinonSpy;

    before(() => {
      userName = 'sarah';
      teamName = 'Rosie';
      error = new Error('when user already exists and createTeam fails');

      sinon.stub(robot.client, 'getUser').returns(Promise.resolve({ ok: true, user: { team: {} } }));
      sinon.stub(robot.client, 'createTeam').returns(Promise.reject(error));
      emitStub = sinon.stub(robot, 'emit');

      sinon.stub(dataStore, 'getUserById')
        .withArgs(userName)
        .returns({ id: userName, profile: { email: 'bark' } } as User);

      return room.user.say(userName, `@hubot create team ${teamName}`);
    });

    it('should emit the error', () => {
      expect(emitStub).to.have.been.calledWith('error', error, sinon.match.object);
    });

    it('should tell the user that there is a problem', () => {
      expect(room.messages).to.eql([
        [userName, `@hubot create team ${teamName}`],
        ['hubot', `@${userName} I'm sorry, there appears to be a big problem!`],
      ]);
    });
  });
});
