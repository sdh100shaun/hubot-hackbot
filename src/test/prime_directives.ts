import { expect } from 'chai';

import * as Helper from 'hubot-test-helper';
const helper = new Helper('../hackbot.js');

describe('@hubot prime directives', () => {
  
  let $room: Helper.Room;
    
  before(() => {
    $room = helper.createRoom()
  });

  after(() => {
    $room.destroy();
  });

  it('should tell the user hubot\'s prime directives', () => {
    return $room.user.say('bob', '@hubot what are your prime directives?').then(() => {
      expect($room.messages).to.eql([
        ['bob', '@hubot what are your prime directives?'],
        ['hubot', `@bob 1. Serve the public trust\n2. Protect the innocent hackers\n3. Uphold the Code of Conduct\n4. [Classified]`]
      ]);
    });
  });
});
