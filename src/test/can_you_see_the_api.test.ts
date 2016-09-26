import { expect } from 'chai';
import * as sinon from 'sinon';
import { RobotWithClient } from '../hackbot';
import * as Helper from 'hubot-test-helper';

describe('Can you see the API?', () => {

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

  describe('can see the API', () => {

    before(setUp);
    after(tearDown);

    before(() => {
      sinon.stub(robot.client, 'checkApi').returns(Promise.resolve({ ok: true }));

      return room.user.say('bob', '@hubot can you see the api?');
    });

    it('should reply to the user that the API is available', () => {
      expect(room.messages).to.eql([
        ['bob', '@hubot can you see the api?'],
        ['hubot', `@bob I'll have a quick look for you...`],
        ['hubot', '@bob I see her!'],
      ]);
    });
  });

  describe('unable to see the API', () => {

    before(setUp);
    after(tearDown);

    before(() => {
      sinon.stub(robot.client, 'checkApi').returns(Promise.resolve({ ok: false, statusCode: 99 }));

      return room.user.say('bob', '@hubot can you see the api?');
    });

    it('should reply to the user that the API cannot be seen', () => {
      expect(room.messages).to.eql([
        ['bob', '@hubot can you see the api?'],
        ['hubot', `@bob I'll have a quick look for you...`],
        ['hubot', `@bob I'm sorry, there appears to be a problem; something about "99"`],
      ]);
    });
  });

  describe('unable to see the API because of a http error', () => {

    before(setUp);
    after(tearDown);

    let error: Error;
    let loggerErrorStub: sinon.SinonStub;

    before(() => {
      error = new Error('unable to see the API because of a http error');

      sinon.stub(robot.client, 'checkApi').returns(Promise.reject(error));
      loggerErrorStub = sinon.stub(robot.logger, 'error');

      return room.user.say('bob', '@hubot can you see the api?');
    });

    it('should log the error', () => {
      expect(loggerErrorStub).to.have.been.calledWith(error.stack);
    });

    it('should reply to the user that the API cannot be seen because of a big problem', () => {
      expect(room.messages).to.eql([
        ['bob', '@hubot can you see the api?'],
        ['hubot', `@bob I'll have a quick look for you...`],
        ['hubot', '@bob I\'m sorry, there appears to be a big problem!'],
      ]);
    });
  });
});
