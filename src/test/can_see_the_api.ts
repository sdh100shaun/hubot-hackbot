import { expect } from 'chai';
import { RobotWithHack24Client } from '../hackbot';

import * as Helper from 'hubot-test-helper';
const helper = new Helper('../hackbot.js');

describe('Can see the API', () => {

  describe('hubot can see the API', () => {

    let room: Helper.Room;

    before(() => {
      room = helper.createRoom();

      const robot = <RobotWithHack24Client>room.robot;

      robot.hack24client = <any>{
        checkApi: () => Promise.resolve({ ok: true })
      };

      room.user.say('bob', '@hubot can you see the api?');
    });

    after(() => {
      room.destroy();
    });

    it('should reply to the user that the API is available', () => {
      expect(room.messages).to.eql([
        ['bob', '@hubot can you see the api?'],
        ['hubot', `@bob I'll have a quick look for you...`],
        ['hubot', '@bob I see her!']
      ]);
    });
  });

  describe('hubot is unable to see the API', () => {

    let room: Helper.Room;

    before(() => {
      room = helper.createRoom()

      const robot = <RobotWithHack24Client>room.robot;

      robot.hack24client = <any>{
        checkApi: () => Promise.resolve({ ok: false, statusCode: 99 })
      };

      room.user.say('bob', '@hubot can you see the api?');
    });

    after(() => {
      room.destroy();
    });

    it('should reply to the user that he cannot see the API', () => {
      expect(room.messages).to.eql([
        ['bob', '@hubot can you see the api?'],
        ['hubot', `@bob I'll have a quick look for you...`],
        ['hubot', `@bob I'm sorry, there appears to be a problem; something about "99"`]
      ]);
    });
  });

  describe('hubot is unable to see the API because of a http error', () => {

    let room: Helper.Room;

    before(() => {
      room = helper.createRoom()

      const robot = <RobotWithHack24Client>room.robot;

      robot.hack24client = <any>{
        checkApi: () => Promise.reject(new Error('unknown'))
      };

      room.user.say('bob', '@hubot can you see the api?');
    });

    after(() => {
      room.destroy();
    });

    it('should reply to the user that he cannot see the API because of a big problem', () => {
      expect(room.messages).to.eql([
        ['bob', '@hubot can you see the api?'],
        ['hubot', `@bob I'll have a quick look for you...`],
        ['hubot', '@bob I\'m sorry, there appears to be a big problem!']
      ]);
    });
  });
});