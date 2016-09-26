import { expect } from 'chai';
import * as Helper from 'hubot-test-helper';

describe.skip('@hubot my id', () => {

  let room: Helper.Room;

  before(() => {
    const helper = new Helper('../index.js');
    room = helper.createRoom();

    return room.user.say('bob', '@hubot my id');
  });

  after(() => room.destroy());

  it('should tell the user their identifier', () => {
    expect(room.messages).to.eql([
      ['bob', '@hubot my id'],
      ['hubot', `@bob Your id is bob`],
    ]);
  });
});
