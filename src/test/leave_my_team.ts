import { expect, use as chaiUse } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { RobotWithHack24Client } from '../hackbot';
import { UserData } from 'hubot';
import { Client } from '../client';

chaiUse(sinonChai);

import * as Helper from 'hubot-test-helper';
const helper = new Helper('../hackbot.js');

describe('@hubot leave my team', () => {

  describe('when in a team', () => {

    let $room: Helper.Room;
    let $userId: string;
    let $userEmail: string;
    let $existingTeamId: string;
    let $existingTeamName: string;
    let $getUserStub: sinon.SinonStub;
    let $removeTeamMemberStub: sinon.SinonStub;

    before(() => {
      $room = helper.createRoom()

      $userId = 'micah'
      $userEmail = 'micah.micah~micah'
      $existingTeamId = 'ocean-mongrels'
      $existingTeamName = 'Ocean Mongrels'

      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: $existingTeamId,
            name: $existingTeamName
          }
        }
      }));

      $removeTeamMemberStub = sinon.stub().returns(Promise.resolve({ ok: true }));

      const robot = <RobotWithHack24Client>$room.robot;

      robot.hack24client = <any>{
        getUser: $getUserStub,
        removeTeamMember: $removeTeamMemberStub
      };

      robot.brain.data.users[$userId] = <UserData>{
        email_address: $userEmail
      };

      return $room.user.say($userId, '@hubot leave my team');
    });

    it('should get the user', () => {
      expect($getUserStub).to.have.been.calledWith($userId);
    });

    it('should update the team, excluding the current user in the member list', () => {
      expect($removeTeamMemberStub).to.have.been.calledWith($existingTeamId, $userId, $userEmail);
    });

    it('should tell the user that they have left the team', () => {
      expect($room.messages).to.eql([
        [$userId, '@hubot leave my team'],
        ['hubot', `@${$userId} OK, you've been removed from team "${$existingTeamName}"`]
      ]);
    });

    after(() => {
      $room.destroy();
    });
  });

  describe('when not a registered attendee', () => {

    let $room: Helper.Room;
    let $userId: string;
    let $userEmail: string;
    let $existingTeamId: string;
    let $existingTeamName: string;
    let $getUserStub: sinon.SinonStub;
    let $removeTeamMemberStub: sinon.SinonStub;

    before(() => {
      $room = helper.createRoom()

      $userId = 'micah'
      $userEmail = 'micah.micah~micah'
      $existingTeamId = 'ocean-mongrels'
      $existingTeamName = 'Ocean Mongrels'

      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: $existingTeamId,
            name: $existingTeamName
          }
        }
      }));

      $removeTeamMemberStub = sinon.stub().returns(Promise.resolve({
        ok: false,
        statusCode: 403
      }));

      const robot = <RobotWithHack24Client>$room.robot;

      robot.hack24client = <any>{
        getUser: $getUserStub,
        removeTeamMember: $removeTeamMemberStub
      };

      robot.brain.data.users[$userId] = <UserData>{
        email_address: $userEmail
      };

      return $room.user.say($userId, '@hubot leave my team');
    });

    it('should tell the user that they have left the team', () => {
      expect($room.messages).to.eql([
        [$userId, '@hubot leave my team'],
        ['hubot', `@${$userId} Sorry, you don't have permission to leave your team.`]
      ]);
    });

    after(() => {
      $room.destroy();
    });
  });

  describe('when not in a team', () => {

    let $room: Helper.Room;
    let $userId: string;
    let $getUserStub: sinon.SinonStub;

    before(() => {
      $room = helper.createRoom()

      $userId = 'sarah'

      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        user: {
          team: {
            id: undefined
          }
        }
      }));

      const robot = <RobotWithHack24Client>$room.robot;

      robot.hack24client = <any>{
        getUser: $getUserStub
      };

      robot.brain.data.users[$userId] = <UserData>{
        email_address: 'asdlkjalkdsjas'
      };

      return $room.user.say($userId, '@hubot leave my team');
    });

    it('should get the user', () => {
      expect($getUserStub).to.have.been.calledWith($userId);
    });

    it('should tell the user that they are not in a team', () => {
      expect($room.messages).to.eql([
        [$userId, '@hubot leave my team'],
        ['hubot', `@${$userId} You're not in a team! :goberserk:`]
      ]);
    });

    after(() => {
      $room.destroy();
    });
  });

  describe('when user does not exist', () => {

    let $room: Helper.Room;
    let $userId: string;
    let $getUserStub: sinon.SinonStub;

    before(() => {
      $room = helper.createRoom()

      $userId = 'sarah'

      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: false,
        statusCode: 404
      }));

      const robot = <RobotWithHack24Client>$room.robot;

      robot.hack24client = <any>{
        getUser: $getUserStub
      };

      robot.brain.data.users[$userId] = <UserData>{
        email_address: 'sdfsfdsfsdf'
      };

      return $room.user.say($userId, '@hubot leave my team');
    });

    it('should get the user', () => {
      expect($getUserStub).to.have.been.calledWith($userId);
    });

    it('should tell the user that they are not in a team', () => {
      expect($room.messages).to.eql([
        [$userId, '@hubot leave my team'],
        ['hubot', `@${$userId} You're not in a team! :goberserk:`]
      ]);
    });

    after(() => {
      $room.destroy();
    });
  });

  describe('when getUser fails', () => {

    let $room: Helper.Room;

    before(() => {
      $room = helper.createRoom()

      const robot = <RobotWithHack24Client>$room.robot;

      robot.hack24client = <any>{
        getUser: () => Promise.reject(new Error('unknown'))
      };

      return $room.user.say('sarah', '@hubot leave my team');
    });

    it('should tell the user that there is a problem', () => {
      expect($room.messages).to.eql([
        ['sarah', '@hubot leave my team'],
        ['hubot', '@sarah I\'m sorry, there appears to be a big problem!']
      ]);
    });

    after(() => {
      $room.destroy();;
    });
  });

  describe('when removeTeamMember fails', () => {

    let $room: Helper.Room;

    before(() => {
      $room = helper.createRoom()

      const robot = <RobotWithHack24Client>$room.robot;

      robot.hack24client = <any>{
        getUser: () => Promise.resolve({
          ok: true,
          user: {
            team: { id: '234324' }
          }
        }),
        removeTeamMember: () => Promise.reject(new Error('when removeTeamMember fails'))
      };

      return $room.user.say('sarah', '@hubot leave my team');
    });

    it('should tell the user that there is a problem', () => {
      expect($room.messages).to.eql([
        ['sarah', '@hubot leave my team'],
        ['hubot', '@sarah I\'m sorry, there appears to be a big problem!']
      ]);
    });

    after(() => {
      $room.destroy();
    });
  });
});
