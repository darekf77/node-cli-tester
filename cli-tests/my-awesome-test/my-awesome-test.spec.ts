import * as _ from 'lodash';
import * as path from 'path';
import { describe, before, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { CLASS } from 'typescript-class-helpers';
import { Helpers, Project } from 'tnp-helpers';
import { NodeCliTester  } from 'node-cli-tester';

describe('My Awesome Test', () => {

  // PUT ALL YOUR TESTS HERE

  it('should works example unit test', () => {
    // const testName = this.test.title;
// const testFullName = this.test.fullTitle();
    expect(1).to.be.gt(0)
  });

});
