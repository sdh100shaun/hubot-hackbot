import { expect, use as chaiUse } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { RobotWithHack24Client } from '../hackbot';
import { UserData } from 'hubot';
import { Client } from '../client';

chaiUse(sinonChai);

import * as Helper from 'hubot-test-helper';
const helper = new Helper('../hackbot.js');

describe('@hubot our motto is X', () => {

  describe('when user in a team', () => {
    
    let $room: Helper.Room;
    let $userId: string;
    let $userEmail: string;
    let $teamId: string;
    let $teamName: string;
    let $motto: string;
    let $getUserStub: sinon.SinonStub;
    let $updateMottoStub: sinon.SinonStub;

    before(() => {
      $room = helper.createRoom()
      $userId = 'jerry'
      $userEmail = 'jerry@jerry.jerry'
      $teamId = 'my-crazy-team-name'
      $teamName = 'My Crazy Team Name'
      $motto = 'We are great'

      const robot = <RobotWithHack24Client> $room.robot;

      robot.brain.data.users[$userId] = <UserData> { email_address: $userEmail };

      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        user: {
          id: $userId,
          team: {
            id: $teamId,
            name: $teamName
          }
        }
      }));

      $updateMottoStub = sinon.stub().returns(Promise.resolve({ ok: true }));

      robot.hack24client = <any> {
        getUser: $getUserStub,
        updateMotto: $updateMottoStub
      };

      return $room.user.say($userId, `@hubot our motto is ${$motto}`);
    });

    it('should fetch the user', () => {
      expect($getUserStub).to.have.been.calledWith($userId);
    });

    it('should update the team motto', () => {
      expect($updateMottoStub).to.have.been.calledWith($motto, $teamId, $userEmail);
    });

    it('should tell the user the new motto', () => {
      expect($room.messages).to.eql([
        [$userId, `@hubot our motto is ${$motto}`],
        ['hubot', `@${$userId} So it is! As ${$teamName} say: ${$motto}`]
      ]);
    });

    after(() => {
      $room.destroy();
    });
  });

  describe('when team exists without permission', () => {
    
    let $room: Helper.Room;
    let $userId: string;
    let $motto: string;
    let $getUserStub: sinon.SinonStub;
    let $updateMottoStub: sinon.SinonStub;

    before(() => {
      $room = helper.createRoom()

      $userId = 'jerry'
      $motto = 'We are great'

      const robot = <RobotWithHack24Client> $room.robot;

      robot.brain.data.users[$userId] = <UserData> { email_address: 'jerry@jerry.jerry' };

      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        user: {
          id: $userId,
          team: { id: 'my-crazy-team-name' }
        }
      }));

      $updateMottoStub = sinon.stub().returns(Promise.resolve({
        ok: false,
        statusCode: 403
      }));

      robot.hack24client = <any> {
        getUser: $getUserStub,
        updateMotto: $updateMottoStub
      };

      return $room.user.say($userId, `@hubot our motto is ${$motto}`);
    });

    it('should tell the user they do not have permission', () => {
      expect($room.messages).to.eql([
        [$userId, `@hubot our motto is ${$motto}`],
        ['hubot', `@${$userId} Sorry, only team members can change the motto.`]
      ]);
    });

    after(() => {
      $room.destroy();
    });
  });

  describe('when user not in a team', () => {
    
    let $room: Helper.Room;
    let $userId: string;
    let $getUserStub: sinon.SinonStub;

    before(() => {
      $room = helper.createRoom()

      $userId = 'jerry'

      const robot = <RobotWithHack24Client> $room.robot;

      robot.brain.data.users[$userId] = <UserData> { email_address: 'jerry@jerry.jerry' };

      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        user: {
          id: $userId,
          team: {}
        }
      }));

      robot.hack24client = <any> {
        getUser: $getUserStub
      };

      return $room.user.say($userId, '@hubot our motto is We are great');
    });

    it('should tell the user the motto is changed', () => {
      expect($room.messages).to.eql([
        [$userId, '@hubot our motto is We are great'],
        ['hubot', `@${$userId} You're not in a team! :goberserk:`]
      ]);
    });

    after(() => {
      $room.destroy();
    });
  });

  describe('when user unknown', () => {
    
    let $room: Helper.Room;
    let $userId: string;
    let $getUserStub: sinon.SinonStub;

    before(() => {
      $room = helper.createRoom()

      $userId = 'jerry'

      const robot = <RobotWithHack24Client> $room.robot;

      robot.brain.data.users[$userId] = <UserData> { email_address: 'jerry@jerry.jerry' };

      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: false,
        statusCode: 404
      }));

      robot.hack24client = <any> {
        getUser: $getUserStub
      };

      return $room.user.say($userId, '@hubot our motto is We are great');
    });

    it('should tell the user the motto is changed', () => {
      expect($room.messages).to.eql([
        [$userId, '@hubot our motto is We are great'],
        ['hubot', `@${$userId} You're not in a team! :goberserk:`]
      ]);
    });

    after(() => {
      $room.destroy();
    });
  });
});
