//#region imports
import * as _ from 'lodash';
import { CLASS } from 'typescript-class-helpers';
import { Helpers } from 'tnp-helpers';
//#endregion

//#region base imports contant
const baseImports = `
import * as _ from 'lodash';
import * as path from 'path';
import { describe, before, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import { CLASS } from 'typescript-class-helpers';
import { Helpers } from 'tnp-helpers';
import { NodeCliTester  } from 'node-cli-tester';
`.trim();

const testMeta = `
// const testName = this.test.title;
// const testFullName = this.test.fullTitle();
`.trim();
//#endregion
@CLASS.NAME('TestTemplates')
export class TestTemplates {
  public static DEFAULT_COMMAND = `my-command-to-run`;
  public static PROJECT_ENTITY_LOCATION = `tnp-helpers`;

  //#region create test part
  public static testPart(pathToFile: string, projPath: string, timeHash: string) {
    return `
${baseImports}
import { Project } from '${this.PROJECT_ENTITY_LOCATION}';

describe('${projPath}',()=> {

  it('Should pass the test with hash ${timeHash}', async  () => {
${testMeta}
   const cwd = path.join(__dirname,'${timeHash}');
   const relativePathToFile = '${projPath}/${pathToFile}';
   const absolutePathToTestFile = path.join(cwd,relativePathToFile);
   Helpers.remove(cwd);
   const Project = CLASS.getByName('Project') as typeof Project;
   const proj = Project.From(cwd);
   proj.run(\`${this.DEFAULT_COMMAND} param1 param2 \`,{ biggerBuffer: false }).sync()
   expect(true).to.not.be.true;
 })

})
  `.trim() + '\n\n';
  }
  //#endregion

  //#region regenerate spec ts
  public static regenerateSpecTs(specTsPath: string, testName: string) {
    if (!Helpers.exists(specTsPath)) {
      Helpers.writeFile(specTsPath,
        //#region content of *.spec.ts
        `
${baseImports}
import { Project } from '${this.PROJECT_ENTITY_LOCATION}';

describe('${_.startCase(testName)}', () => {

  // PUT ALL YOUR TESTS HERE

  it('should works example unit test', () => {
${testMeta}
    expect(1).to.be.gt(0)
  });

});
`.trim() + '\n'
        //#endregion
      );
    }
  }
  //#endregion

}
