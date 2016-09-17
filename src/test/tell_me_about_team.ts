import { expect, use as chaiUse } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { RobotWithHack24Client } from '../hackbot';
import { UserData } from 'hubot';
import { Client } from '../client';

chaiUse(sinonChai);

import * as Helper from 'hubot-test-helper';
const helper = new Helper('../hackbot.js');

describe('@hubot tell me about team X', () => {

  describe('when team exists with members and a motto', () => {
    
    let $room: Helper.Room;
    let $userId: string;
    let $teamId: string;
    let $teamName: string;
    let $firstTeamMember: string;
    let $secondTeamMember: string;
    let $motto: string;
    let $getTeamStub: sinon.SinonStub;
  
    before(() => {
      $room = helper.createRoom()
      
      $userId = 'jerry'
      $teamId = 'my-crazy-team-name'
      $teamName = 'My Crazy Team Name'
      $firstTeamMember = 'Jerry'
      $secondTeamMember = 'Bob'
      $motto = 'Pikes and spikes hurt on bikes'
        
      $getTeamStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        team: {
          id: $teamId,
          name: $teamName,
          motto: $motto,
          members: [{
            name: $firstTeamMember
          },{
            name: $secondTeamMember
          }]
        }
      }));
      
      const robot = <RobotWithHack24Client> $room.robot;
      
      robot.hack24client = <any> {
        getTeam: $getTeamStub
      };
      
      return $room.user.say($userId, `@hubot tell me about team     ${$teamName}         `);
    });

    it('should fetch the team by slug (teamid)', () => {
      expect($getTeamStub).to.have.been.calledWith($teamId);
    });

    it('should tell the user the team information', () => {
      expect($room.messages).to.eql([
        [$userId, `@hubot tell me about team     ${$teamName}         `],
        ['hubot', `@${$userId} "${$teamName}" has 2 members: ${$firstTeamMember}, ${$secondTeamMember}\r\nThey say: ${$motto}`]
      ]);
    });
    
    after(() => {
      $room.destroy();
    });
  });

  describe('when team exists with one member and no motto', () => {
    
    let $room: Helper.Room;
    let $userId: string;
    let $teamName: string;
    let $teamMember: string;
    let $getTeamStub: sinon.SinonStub;
  
    before(() => {
      $room = helper.createRoom()
      
      $userId = 'megan'
      $teamName = 'My Crazy Team Name'
      $teamMember = 'John'
        
      $getTeamStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        team: {
          name: 'My Crazy Team Name',
          motto: null,
          members: [{
            name: $teamMember
          }]
        }
      }));
      
      const robot = <RobotWithHack24Client> $room.robot;
      
      robot.hack24client = <any> {
        getTeam: $getTeamStub
      };
      
      return $room.user.say($userId, `@hubot tell me about team     ${$teamName}         `);
    });

    it('should tell the user the team information', () => {
      expect($room.messages).to.eql([
        [$userId, `@hubot tell me about team     ${$teamName}         `],
        ['hubot', `@${$userId} "${$teamName}" has 1 member: ${$teamMember}\r\nThey don't yet have a motto!`]
      ]);
    });
    
    after(() => {
      $room.destroy();
    });
  });

  describe('when team exists with the user as the only member and a motto', () => {
    
    let $room: Helper.Room;
    let $userId: string;
    let $teamName: string;
    let $motto: string;
    let $getTeamStub: sinon.SinonStub;
  
    before(() => {
      $room = helper.createRoom()
      
      $userId = 'frank'
      $teamName = 'My Crazy Team Name'
      $motto = 'Hipsters, everywhere!'
        
      $getTeamStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        team: {
          name: $teamName,
          motto: $motto,
          members: [{
            id: $userId,
            name: $userId
          }]
        }
      }));
      
      const robot = <RobotWithHack24Client> $room.robot;
      
      robot.hack24client = <any> {
        getTeam: $getTeamStub
      };
      
      return $room.user.say($userId, `@hubot tell me about team     ${$teamName}         `);
    });

    it('should tell the user the team information', () => {
      expect($room.messages).to.eql([
        [$userId, `@hubot tell me about team     ${$teamName}         `],
        ['hubot', `@${$userId} You are the only member of "${$teamName}" and your motto is: ${$motto}`]
      ]);
    });
    
    after(() => {
      $room.destroy();
    });
  });

  describe('when team exists with the user as the only member and no motto', () => {
    
    let $room: Helper.Room;
    let $userId: string;
    let $teamName: string;
    let $getTeamStub: sinon.SinonStub;
  
    before(() => {
      $room = helper.createRoom()
      
      $userId = 'frank'
      $teamName = 'My Crazy Team Name'
        
      $getTeamStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        team: {
          name: $teamName,
          motto: null,
          members: [{
            id: $userId,
            name: $userId
          }]
        }
      }));
      
      const robot = <RobotWithHack24Client> $room.robot;
      
      robot.hack24client = <any> {
        getTeam: $getTeamStub
      };
      
      return $room.user.say($userId, `@hubot tell me about team     ${$teamName}         `);
    });

    it('should tell the user the team information', () => {
      expect($room.messages).to.eql([
        [$userId, `@hubot tell me about team     ${$teamName}         `],
        ['hubot', `@${$userId} You are the only member of "${$teamName}" and you have not yet set your motto!`]
      ]);
    });
    
    after(() => {
      $room.destroy();
    });
  });

  describe('when team exists with no members', () => {
    
    let $room: Helper.Room;
    let $getTeamStub: sinon.SinonStub;
  
    before(() => {
      $room = helper.createRoom()
        
      $getTeamStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        team: {
          id: 'my-crazy-team-name',
          name: 'My Crazy Team Name',
          members: []
        }
      }));
      
      const robot = <RobotWithHack24Client> $room.robot;
      
      robot.hack24client = <any> {
        getTeam: $getTeamStub
      };
      
      return $room.user.say('sarah', '@hubot tell me about team     my cRAZY team name         ');
    });

    it('should fetch the team by slug (teamid)', () => {
      expect($getTeamStub).to.have.been.calledWith('my-crazy-team-name');
    });

    it('should tell the user the team information', () => {
      expect($room.messages).to.eql([
        ['sarah', '@hubot tell me about team     my cRAZY team name         '],
        ['hubot', '@sarah "My Crazy Team Name" is an empty team.']
      ]);
    });
    
    after(() => {
      $room.destroy();
    });
  });

  describe('when team does not exist', () => {
    
    let $room: Helper.Room;
    let $getTeamStub: sinon.SinonStub;
  
    before(() => {
      $room = helper.createRoom()
      
      $getTeamStub = sinon.stub().returns(Promise.resolve({
        ok: false,
        statusCode: 404
      }));
      
      const robot = <RobotWithHack24Client> $room.robot;
      
      robot.hack24client = <any> {
        getTeam: $getTeamStub
      };
      
      return $room.user.say('sarah', '@hubot tell me about team  :smile:');
    });

    it('should fetch the team by slug (teamid)', () => {
      expect($getTeamStub).to.have.been.calledWith('smile');
    });

    it('should tell the user the team does not exist', () => {
      expect($room.messages).to.eql([
        ['sarah', '@hubot tell me about team  :smile:'],
        ['hubot', "@sarah Sorry, I can't find that team."]
      ]);
    });
    
    after(() => {
      $room.destroy();
    });
  });

  describe('when get team fails', () => {
    
    let $room: Helper.Room;
  
    before(() => {
      $room = helper.createRoom()
      
      const robot = <RobotWithHack24Client> $room.robot;
        
      robot.hack24client = <any> {
        getTeam: () => Promise.resolve({ ok: false })
      };

      return $room.user.say('sarah', '@hubot tell me about team     my crazy team name         ');
    });

    it('should tell the user that there is a problem', () => {
      expect($room.messages).to.eql([
        ['sarah', '@hubot tell me about team     my crazy team name         '],
        ['hubot', '@sarah Sorry, there was a problem when I tried to look up that team :frowning:']
      ]);
    });
    
    after(() => {
      $room.destroy();
    });
  });
});
