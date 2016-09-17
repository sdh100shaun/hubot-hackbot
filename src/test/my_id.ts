import { expect } from 'chai';

import * as Helper from 'hubot-test-helper';
const helper = new Helper('../hackbot.js');

describe('@hubot my id', () => {

  let room: Helper.Room;

  before(() => {
    room = helper.createRoom()
  });

  after(() => {
    room.destroy();
  });

  it('should tell the user their identifier', () => {
    room.user.say('bob', '@hubot my id').then(() => {
      expect(room.messages).to.eql([
        ['bob', '@hubot my id'],
        ['hubot', `@bob Your id is bob`]
      ]);
    });
  });
});
