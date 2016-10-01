import { use } from 'chai';
import * as sinonChai from 'sinon-chai';

before(() => {
  use(sinonChai);
  process.env['HACKBOT_API_URL'] = 'http://localhost:64201';
  process.env['HACKBOT_API_PASSWORD'] = 'not a real password';
});
