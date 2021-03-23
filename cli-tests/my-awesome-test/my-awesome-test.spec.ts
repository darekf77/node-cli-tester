
import * as _ from 'path';
import { describe, before, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { recreateEnvironment  } from 'node-cli-tester';

describe('My Awesome Test', () => {

  // PUT ALL YOUR TESTS HERE

  // @ts-ignore
  it('should works example unit test', () => {
    expect(1).to.be.gt(0)
  });
});
