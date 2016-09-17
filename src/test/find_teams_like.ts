import { expect, use as chaiUse } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { RobotWithHack24Client } from '../hackbot';
import { UserData } from 'hubot';
import { Client } from '../client';

chaiUse(sinonChai);

import * as Helper from 'hubot-test-helper';
const helper = new Helper('../hackbot.js');

describe('@hubot find teams like X', () => {

  describe('when matching teams found', () => {

    let $room: Helper.Room;
    let $findTeamsStub: sinon.SinonStub;

    before(() => {
      $room = helper.createRoom()

      $findTeamsStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        teams: [
          { name: 'Hack Hackers Hacking Hacks' },
          { name: 'Hackers Hacking Hack Hacks' },
          { name: 'Another Team' },
          { name: 'b' }
        ]
      }));

      const robot = <RobotWithHack24Client>$room.robot;

      robot.hack24client = <any>{
        findTeams: $findTeamsStub
      };

      return $room.user.say('paolo', '@hubot find teams like hacking hack');
    });

    it('should find teams matching the search', () => {
      expect($findTeamsStub).to.have.been.calledWith('hacking hack');
    });

    it('should tell the user which teams were found', () => {
      expect($room.messages).to.eql([
        ['paolo', '@hubot find teams like hacking hack'],
        ['hubot', `@paolo Found 4 teams; here's a few: Hack Hackers Hacking Hacks, Hackers Hacking Hack Hacks, Another Team`]
      ]);
    });

    after(() => {
      $room.destroy();
    });
  });

  describe('when no matching teams found', () => {

    let $room: Helper.Room;
    let $findTeamsStub: sinon.SinonStub;

    before(() => {
      $room = helper.createRoom()

      $findTeamsStub = sinon.stub().returns(Promise.resolve({
        ok: true,
        teams: []
      }));

      const robot = <RobotWithHack24Client>$room.robot;

      robot.hack24client = <any>{
        findTeams: $findTeamsStub
      };

      return $room.user.say('paolo', '@hubot find teams like hacking hack');
    });

    it('should tell the user that no teams were found', () => {
      expect($room.messages).to.eql([
        ['paolo', '@hubot find teams like hacking hack'],
        ['hubot', '@paolo None found.']
      ]);
    });

    after(() => {
      $room.destroy();
    });
  });
});