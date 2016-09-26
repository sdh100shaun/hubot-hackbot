import { Response, Message } from 'hubot';
import { ISlackAdapter, ICustomMessageData } from 'hubot-slack';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { RobotWithClient } from '../hackbot';
import * as Helper from 'hubot-test-helper';
import Config from '../config';

describe('Error Handler', () => {

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

  describe('catches an error with Slack adapter', () => {

    before(setUp);
    after(tearDown);

    let error: Error;
    let expectedCustomMessage: ICustomMessageData;
    let loggerErrorStub: sinon.SinonStub;
    let customMessageStub: sinon.SinonSpy;
    let sendSpy: sinon.SinonSpy;

    before(() => {
      error = new Error('catches an error with Slack adapter');
      Config.error_channel = '#my_error_channel';

      expectedCustomMessage = {
        channel: Config.error_channel,
        attachments: [{
          fallback: `I've just encountered this error: ${error}`,
          color: '#801515',
          title: `I've just encountered an error`,
          text: `\`\`\`\n${error.stack}\n\`\`\``,
          mrkdwn_in: ['text'],
        }],
      };

      loggerErrorStub = sinon.stub(robot.logger, 'error');

      const adapter = robot.adapter as ISlackAdapter;
      customMessageStub = adapter.customMessage = sinon.stub();
      sendSpy = sinon.spy(robot.adapter, 'send');

      room.robot.emit('error', error);
    });

    it('should log the error', () => {
      expect(loggerErrorStub).to.have.been.calledWith(error.stack);
    });

    it('should print the custom message error in the slack error_channel', () => {
      expect(customMessageStub).to.have.been.calledWith(expectedCustomMessage);
    });

    it('should not print the error in the error_channel', () => {
      expect(sendSpy).to.not.have.been.called;
    });
  });

  describe('catches an error with Slack adapter with a response', () => {

    before(setUp);
    after(tearDown);

    let replySpy: sinon.SinonSpy;

    before(() => {
      const message = new Message(room.user);
      const response = new Response(room.robot, message, null);

      sinon.stub(robot.logger, 'error');

      const adapter = robot.adapter as ISlackAdapter;
      adapter.customMessage = sinon.stub();
      replySpy = sinon.spy(response, 'reply');

      room.robot.emit('error', new Error(), response);
    });

    it('should reply to the user that there was an error', () => {
      expect(replySpy).to.have.been.calledWith('Uhh, sorry, I just experienced an error :goberserk:');
    });
  });

  describe('catches an error without Slack adapter', () => {

    before(setUp);
    after(tearDown);

    let error: Error;
    let expectedMessage: string;
    let loggerErrorStub: sinon.SinonStub;
    let sendSpy: sinon.SinonSpy;

    before(() => {
      error = new Error('catches an error with Slack adapter');
      Config.error_channel = '#another_error_channel';

      expectedMessage = `I've just encountered this error: ${error}`;

      loggerErrorStub = sinon.stub(robot.logger, 'error');
      sendSpy = sinon.spy(robot.adapter, 'send');

      room.robot.emit('error', error);
    });

    it('should log the error', () => {
      expect(loggerErrorStub).to.have.been.calledWith(error.stack);
    });

    it('should print the error in the error_channel', () => {
      expect(sendSpy).to.have.been.calledWith({ room: Config.error_channel }, expectedMessage);
    });
  });

  describe('catches an error without Slack adapter with a response', () => {

    before(setUp);
    after(tearDown);

    let replySpy: sinon.SinonSpy;

    before(() => {
      const message = new Message(room.user);
      const response = new Response(room.robot, message, null);

      replySpy = sinon.spy(response, 'reply');
      sinon.stub(robot.logger, 'error');

      room.robot.emit('error', new Error(), response);
    });

    it('should reply to the user that there was an error', () => {
      expect(replySpy).to.have.been.calledWith('Uhh, sorry, I just experienced an error :goberserk:');
    });
  });

});
