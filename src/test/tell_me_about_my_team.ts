import { expect, use as chaiUse } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { RobotWithHack24Client } from '../hackbot';
import { UserData } from 'hubot';
import { Client } from '../client';

chaiUse(sinonChai);

import * as Helper from 'hubot-test-helper';
const helper = new Helper('../hackbot.js');

describe('@hubot tell me about my team', () => {

  describe('when in a team with a motto', () => {
    
    let $room: Helper.Room;
    let $userId: string;
    let $teamName: string;
    let $firstTeamMember: string;
    let $secondTeamMember: string;
    let $thirdTeamMember: string;
    let $motto: string;
    let $getUserStub: sinon.SinonStub;
  
    before(() => {
      $room = helper.createRoom()
      
      $userId = 'jerry'
      $teamName = 'Pointy Wizards'
      $firstTeamMember = 'Jerry'
      $secondTeamMember = 'Bob'
      $thirdTeamMember = 'Perry'
      $motto = 'Pikes and spikes hurt on bikes'
        
      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        user: {
          id: $userId,
          team: {
            id: 'some team id',
            name: $teamName,
            motto: $motto,
            members: [{
              name: $firstTeamMember
            },{
              name: $secondTeamMember
            },{
              name: $thirdTeamMember
            }]
          }
        }
      }));

      const robot = <RobotWithHack24Client> $room.robot;
      
      robot.hack24client = <any> {
        getUser: $getUserStub
      };
      
      return $room.user.say($userId, `@hubot tell me about my team`);
    });

    it('should fetch the user', () => {
      expect($getUserStub).to.have.been.calledWith($userId);
    });

    it('should tell the user the team information', () => {
      expect($room.messages).to.eql([
        [$userId, `@hubot tell me about my team`],
        ['hubot', `@${$userId} "${$teamName}" has 3 members: ${$firstTeamMember}, ${$secondTeamMember}, ${$thirdTeamMember}\r\nThey say: ${$motto}`]
      ]);
    });
    
    after(() => {
      $room.destroy();
    });
  });

  describe('when in a team without a motto', () => {
    
    let $room: Helper.Room;
    let $userId: string;
    let $teamName: string;
    let $firstTeamMember: string;
    let $secondTeamMember: string;
    let $thirdTeamMember: string;
    let $getUserStub: sinon.SinonStub;
  
    before(() => {
      $room = helper.createRoom()
      
      $userId = 'jerry'
      $teamName = 'Pointy Wizards'
      $firstTeamMember = 'Jerry'
      $secondTeamMember = 'Bob'
      $thirdTeamMember = 'Perry'
        
      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        user: {
          id: $userId,
          team: {
            id: 'johnny-fives',
            name: $teamName,
            motto: null,
            members: [{
              name: $firstTeamMember
            },{
              name: $secondTeamMember
            },{
              name: $thirdTeamMember
            }]
          }
        }
      }));

      const robot = <RobotWithHack24Client> $room.robot;
      
      robot.hack24client = <any> {
        getUser: $getUserStub
      };
      
      return $room.user.say($userId, `@hubot tell me about my team`);
    });

    it('should fetch the user', () => {
      expect($getUserStub).to.have.been.calledWith($userId);
    });

    it('should tell the user the team information', () => {
      expect($room.messages).to.eql([
        [$userId, `@hubot tell me about my team`],
        ['hubot', `@${$userId} "${$teamName}" has 3 members: ${$firstTeamMember}, ${$secondTeamMember}, ${$thirdTeamMember}\r\nThey don't yet have a motto!`]
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
      
      $userId = 'jerry'
        
      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        user: {
          id: $userId,
          team: {}
        }
      }));

      const robot = <RobotWithHack24Client> $room.robot;
      
      robot.hack24client = <any> {
        getUser: $getUserStub
      };
      
      return $room.user.say($userId, `@hubot tell me about my team`);
    });

    it('should fetch the user', () => {
      expect($getUserStub).to.have.been.calledWith($userId);
    });

    it('should tell the user that they are not in a team', () => {
      expect($room.messages).to.eql([
        [$userId, `@hubot tell me about my team`],
        ['hubot', `@${$userId} You're not in a team! :goberserk:`]
      ]);
    });
    
    after(() => {
      $room.destroy();
    });
  });

  describe('when user is unknown', () => {
    
    let $room: Helper.Room;
    let $userId: string;
    let $getUserStub: sinon.SinonStub;
  
    before(() => {
      $room = helper.createRoom()
      
      $userId = 'jerry'
        
      $getUserStub = sinon.stub().returns(Promise.resolve({
        ok: false,
        statusCode: 404
      }));

      const robot = <RobotWithHack24Client> $room.robot;
      
      robot.hack24client = <any> {
        getUser: $getUserStub
      };
      
      return $room.user.say($userId, `@hubot tell me about my team`);
    });

    it('should fetch the user', () => {
      expect($getUserStub).to.have.been.calledWith($userId);
    });

    it('should tell the user that they are not in a team', () => {
      expect($room.messages).to.eql([
        [$userId, `@hubot tell me about my team`],
        ['hubot', `@${$userId} You're not in a team! :goberserk:`]
      ]);
    });
    
    after(() => {
      $room.destroy();
    });
  });

  describe('when getUser errors', () => {
    
    let $room: Helper.Room;
    let $userId: string;
  
    before(() => {
      $room = helper.createRoom()
      
      $userId = 'jerry'

      const robot = <RobotWithHack24Client> $room.robot;
      
      robot.hack24client = <any> {
        getUser: () => Promise.reject(new Error('unknown'))
      };
      
      return $room.user.say($userId, `@hubot tell me about my team`);
    });

    it('should tell the user that there is a problem', () => {
      expect($room.messages).to.eql([
        [$userId, `@hubot tell me about my team`],
        ['hubot', `@${$userId} I'm sorry, there appears to be a big problem!`]
      ]);
    });
    
    after(() => {
      $room.destroy();
    });
  });
});
